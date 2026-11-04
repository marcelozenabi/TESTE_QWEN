import numpy as np, subprocess, os
SR=48000
def wav(name, data):
    d=(data*32767).astype('<i2')
    with open(f'public/{name}.wav','wb') as f:
        import struct, wave
        w=wave.open(f'/tmp/x.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(d.tobytes()); w.close()
        shutil=None
    os.rename('/tmp/x.wav', f'public/{name}.wav')

import wave
def save(name,data):
    d=(np.clip(data,-1,1)*32767).astype('<i2')
    w=wave.open(f'public/{name}.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(d.tobytes()); w.close()

t=lambda s: np.linspace(0,s,int(SR*s),endpoint=False)

# 1. whoosh (crescendo ruidoso com filtro passa-banda simulado por envelope espectral simples)
n=t(1.2); rng=np.random.default_rng(1); air=rng.standard_normal(len(n))
# moving average bandpass
k=np.hanning(200)/np.sum(np.hanning(200)); airf=np.convolve(air,k,'same')
env=(n/1.2)**3*np.sqrt(1-n/1.2+1e-9)*4
save('whoosh.wav',(airf*env*0.9)[:len(n)])

# 2. boom grave
n=t(1.5); f0=52*np.exp(-n*2.4)+30
ph=2*np.pi*np.cumsum(f0)/SR
bass=np.sin(ph)*np.exp(-n*3.0)
n2=t(0.4); hit=np.random.default_rng(2).standard_normal(len(n2))*np.exp(-n2*30)
boom=np.zeros(len(n)); boom[:len(n2)]+=hit*0.5
boom+=bass
save('boom.wav',boom*0.9)

# 3. riser synth
n=t(3.0); swp=110*(2**(n/3.0*4))
sig=(np.sin(2*np.pi*np.cumsum(swp)/SR)+0.5*np.sin(2*np.pi*np.cumsum(swp*2)/SR))
envr=(n/3.0)**2.5*0.5
save('riser.wav',sig*envr)

# 4. motor turbohélice (duas frequências batendo + amplitude modulada = hélice)
dur=2.5; n=t(dur)
rot=38.0 # Hz mod de pás
carrier=0.30*np.sin(2*np.pi*145*n)+0.22*np.sin(2*np.pi*218*n)+0.12*np.sin(2*np.pi*96*n)
mod=0.55+0.45*np.sin(2*np.pi*rot*n)
motor=carrier*mod
noise=np.convolve(np.random.default_rng(3).standard_normal(len(n)),np.hanning(60)/30,'same')*0.10
fade=np.minimum(n*2,(dur-n)*1.5); fade=np.clip(fade,0,1)
save('engine.wav',(motor+noise)*0.5*fade)

# 5. tick caneta
n=t(0.06)
tk=np.random.default_rng(4).standard_normal(len(n))*np.exp(-n*160)
tk=tk-np.convolve(tk,np.ones(50)/50,'same')
save('tick.wav',tk*0.5)

# 6. swoosh curto cena4
n=t(0.7); air=np.convolve(np.random.default_rng(5).standard_normal(len(n)),np.hanning(120)/60,'same')
env=(n/0.7)**2*np.sqrt(np.clip(1-n/0.7,0,1))*3
save('swish.wav',air*env*0.7)

# 7. sino dourado final (parciais inarmônicos)
n=t(2.8)
part=[(523,1),(661,0.5),(786,0.35),(1174,0.22),(1580,0.12)]
bell=np.zeros(len(n))
for fr,a in part:
    bell+=a*np.sin(2*np.pi*fr*n+np.sin(2*np.pi*fr*1.003*n)*0.5)*np.exp(-n*(1.6+fr/900))
save('bell.wav',bell*0.5)

# 8. drone ambiente grave 30s
n=t(30.0)
dr=0.16*np.sin(2*np.pi*55*n)*(1+0.3*np.sin(2*np.pi*0.07*n))
dr+=0.10*np.sin(2*np.pi*82.4*n+np.sin(2*np.pi*0.1*n)*2)
dr+=0.06*np.sin(2*np.pi*110*n)
wind=np.convolve(np.random.default_rng(6).standard_normal(len(n)),np.hanning(900)/450,'same')*0.05*(1+0.5*np.sin(2*np.pi*0.13*n))
fade=np.minimum(n*0.5,(30-n)*0.7); fade=np.clip(fade,0,1)
save('ambient.wav',(dr+wind)*fade)
print("sfx ok", os.listdir('public'))
