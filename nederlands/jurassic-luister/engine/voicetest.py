import azure.cognitiveservices.speech as S, pathlib, sys, json
KEY=pathlib.Path('/Users/ashokkumar/Development/Workspace/Training&Learning/languages/.secrets/azuretts-key').read_text().strip()
T="Dat was een bijzonder moeilijke beslissing, want niemand wist precies wat er zou gebeuren. Toch hebben we het gedaan, hè?"
voices=sys.argv[1:]
for v in voices:
    for mode in ('lang','plain'):
        if v.startswith('nl-') and mode=='lang': continue
        body = f'<lang xml:lang="nl-NL">{T}</lang>' if mode=='lang' else T
        ssml=f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="nl-NL"><voice name="{v}">{body}</voice></speak>'
        cfg=S.SpeechConfig(subscription=KEY,region='francecentral')
        s=S.SpeechSynthesizer(speech_config=cfg,audio_config=None); vis=[]; wb=[]
        s.viseme_received.connect(lambda e: vis.append(e.viseme_id))
        s.synthesis_word_boundary.connect(lambda e: wb.append(e.text))
        r=s.speak_ssml_async(ssml).get()
        ok=r.reason==S.ResultReason.SynthesizingAudioCompleted
        print(v,mode,ok,'visemes',len(vis),'words',len(wb),'bytes',len(r.audio_data) if ok else S.SpeechSynthesisCancellationDetails(r).error_details[:120])
        if ok: open(f'/tmp/vt_{v}_{mode}.wav','wb').write(r.audio_data)
