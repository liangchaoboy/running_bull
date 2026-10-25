# PlantPickup visibility (feel2)

No local `PlantPickup.spx` in xb_src — find the sprite that `onMsg "plantcast"` in XBuilder editor.

Apply:
1. On spawn / show: `setSize` ≈ **1.35×** previous (or floor ~0.9 if was ~0.65).
2. Soft pulse while alive: every 0.02s `setSize base * (1 + 0.08*sin(runT*6))` OR costume BrightnessEffect flicker ±10.
3. On touch/collect: `say "吃到向日葵!"` / 豌豆 / 加特林 / 坚果 for ~0.8s (match plantKind 1–4).
4. Stage already denser: plant interval **1.35s**, boot `plantT=0.35` → first pickup ~1s, ≥2 in first 20s.

Smoke: plant mode 20s → see ≥2 glowing pickups; collect shows 吃到××.
