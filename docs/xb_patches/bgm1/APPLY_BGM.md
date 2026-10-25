# APPLY bgm1 — looping parkour BGM + mute

## Asset
- File: `/workspace/assets/bgm/parkour_loop.ogg` (~643 KB Ogg · ~37.5s · 国风轻松 neolein)
- Upload as Stage sound named **`跑酷BGM`**
- License: CC0 — neolein / *A ride through chinese valley* — see `/workspace/assets/bgm/CREDITS.md`

## Stage onStart (replace footsteps)
```
setVolume 32
play "跑酷BGM", true
muted = false
```

## var
```
muted bool
```

## Mute toggle (Key M)
```
onKey KeyM, => {
	if muted {
		muted = false
		setVolume 32
		play "跑酷BGM", true
	} else {
		muted = true
		setVolume 0
	}
}
```
If KeyM fails to compile, try whatever M key constant the editor lists under 感知事件.

## Publish note
`bgm1：国风轻松循环BGM（CC0 neolein）+M静音`

## mobile-web (after XB Publish)
- Copy ogg → `mobile-web/assets/bgm/parkour_loop.ogg` + CREDITS
- HTMLAudioElement loop, volume 0.32, mute btn + localStorage
- Bust `?v=bgm1`
