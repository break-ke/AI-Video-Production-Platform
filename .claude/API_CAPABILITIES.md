# 灵客AI 平台能力文档

## 平台信息
- 平台：灵客AI (https://lingkeai.vip)
- API Base: https://api.ai6800.com/api
- 认证：Bearer Token
- 余额：1.99 算力 (查询时间: 2026-05-12)

## 图片生成模型

| 模型 | 说明 |
|------|------|
| `doubao-seedream-5-0-260128` | 即梦5.0，字节跳动，支持多图融合、3K输出、联网搜索 |
| `gemini-3-pro-image-preview` | Nano Banana Pro，Google最新超高清，擅长文字渲染 |
| `gpt-image-2` | OpenAI最新图像模型 |
| `vidu-image-2` | Vidu官方，多图参考、图片编辑 |

调用方式：POST /v1/media/generate → 轮询 /v1/skills/task-status?task_id={id}

## 视频生成模型

| 模型 | 说明 |
|------|------|
| `doubao-seedance-1-5-pro-251215` | 即梦3.5 Pro，字节跳动，音画同生，4-12秒 |
| `grok-video-3` | 快速视频生成，6-10秒720P |
| `sora-2` | OpenAI Sora-2官转，高质量 |
| `kwvideo-v2-ref` | SD 2.0参考生视频，1-9张参考图 |

## 语言模型

| 模型 | 格式 | 说明 |
|------|------|------|
| `gpt-5.5` | openai | OpenAI旗舰 |
| `claude-opus-4-7` | anthropic | Claude旗舰 |
| `gemini-3.1-pro-preview` | gemini | Google旗舰 |

Chat接口：
- OpenAI格式: POST /v1/chat/completions
- Anthropic格式: POST /v1/messages
- Gemini格式: POST /v1beta/models/{model}:generateContent

## TTS语音合成
需先通过 /v1/skills/voices 获取音色列表
调用：POST /v1/media/generate

## 任务轮询
POST /v1/media/generate → 返回task_id → GET /v1/skills/task-status?task_id={id}
轮询间隔5秒，以 is_final=true 判定完成
