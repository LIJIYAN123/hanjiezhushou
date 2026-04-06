import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import axios from "axios";

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- 接入您的后端接口 ---
  // 假设您的后端是 Dify 或类似的 API 服务
  const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8088/v1";
  const API_KEY = process.env.BACKEND_API_KEY || "";

  app.post("/api/chat", upload.array("files"), async (req, res) => {
    try {
      const { message } = req.body;
      const files = req.files as Express.Multer.File[];

      console.log(`[Proxy] 转发消息到后端: ${BACKEND_URL}`);

      // 1. 如果有文件，通常需要先调用后端的上传接口 (以 Dify 为例)
      let fileIds: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          // 这里可以根据您的后端 API 文档实现文件上传逻辑
          // console.log(`上传文件: ${file.originalname}`);
        }
      }

      // 2. 调用您的聊天接口
      // 注意：这里需要根据您后端的实际 API 格式（如 Dify, FastGPT 或自定义）进行调整
      // 下面是一个通用的转发示例
      const response = await axios.post(`${BACKEND_URL}/chat-messages`, {
        inputs: {},
        query: message,
        response_mode: "blocking",
        user: "welding-user",
        // files: fileIds // 如果后端支持文件ID
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // 返回后端的结果给前端
      // Dify 的返回路径通常是 data.answer
      const replyText = response.data.answer || response.data.text || "后端未返回有效内容";
      res.json({ text: replyText });

    } catch (error: any) {
      console.error("接入后端失败:", error.message);
      res.status(500).json({ 
        error: "无法连接到您的后端服务", 
        details: error.message,
        hint: "请确保您的后端服务在 " + BACKEND_URL + " 正常运行，并已配置跨域或 API 密钥。"
      });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Welding Assistant Server running on http://localhost:${PORT}`);
  });
}

startServer();
