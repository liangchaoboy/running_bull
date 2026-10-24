# Changelog

## 2026-10-25（玩法 Publish）

- 宽三道面对屏幕：车道约 x=-70/0/70；障碍/金币/炸弹带近大远小缩放。
- 跑动感：牛 跑1–4、鹿 走路1–5、狗 跑帧；落地阴影；换道 lerp。
- 金币：同道 5 连串可捡；HUD「金币」；得分含 金币×10。
- 炸弹：按 **B** 沿当前道上行清障，冷却约 1.6s。
- Publish：https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull
- 未做：真 3D 梯形赛道、滑铲（无 slide 造型）。

## 2026-10-25

- 玩法改为面对屏幕三道跑酷：竖向道路、障碍自上而下、←→/A/D 换道、空格起跳。
- Publish 同链：https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull
- 画面参考：《地铁跑酷》官网 https://pao.uu.cc/phone_index.html（宽三道纵深、饱和色）。
- 进行中：加宽赛道、跑动感、炸弹清障。
- 文档仓 `main` 已同步 intro / 操作说明（本仓库）。活动主库 `neikochan/running_bull` 当前账号仅 pull，待写权限后再同步。
- 新增 [`docs/WECHAT_DISTRIBUTION.md`](WECHAT_DISTRIBUTION.md)：微信 H5 落地路径（今天投链+码为主；小游戏迁出后排）。

## 2026-10-24

- 去活动文案的公开简介；多角色多地图；土路滚动；跳跃/碰撞手感调整；脚步 BGM。
