import asyncio, edge_tts, os

VO = "pt-BR-AntonioNeural"
# Segmentos com timestamps alvo (frames @30fps)
segs = [
    ("vo1", 5,   "Antes de a Embraer existir, um avião brasileiro já estava voando."),
    ("vo2", 148,"Era o Bandeirante, desenvolvido no Centro Técnico de Aeronáutica."),
    ("vo3", 295,"Seu primeiro voo de teste aconteceu em mil novecentos e sessenta e oito."),
    ("vo4", 450,"O desafio seguinte era fabricá-lo em série."),
    ("vo5", 560,"Em mil novecentos e sessenta e nove, nascia a Embraer."),
    ("vo6", 675,"Uma empresa criada depois do avião que ajudaria a transformar a indústria brasileira."),
]

async def run():
    for name, start, text in segs:
        await edge_tts.Communicate(text, VO, rate="+14%").save(f"public/{name}.mp3")

asyncio.run(run())

# padrize volume
for name,_,_ in segs:
    os.system(f"ffmpeg -y -v error -i public/{name}.mp3 -af 'loudnorm=I=-15:TP=-1.5:LRA=11' -ar 48000 -ac 2 public/{name}.wav")
    d = float(os.popen(f"ffprobe -v error -show_entries format=duration -of csv=p=0 public/{name}.wav").read())
    print(name, round(d,2))
