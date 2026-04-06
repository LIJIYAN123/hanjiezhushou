/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Settings, 
  ShieldAlert, 
  Cpu, 
  Send, 
  ChevronRight, 
  Zap, 
  History,
  Terminal,
  Activity,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  UploadCloud
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';

// --- Types ---

interface Attachment {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'file';
}

// --- Components ---

const SparkEffect = () => {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSparks(prev => [
        ...prev.slice(-20),
        { 
          id: Date.now(), 
          x: Math.random() * 100, 
          y: Math.random() * 100,
          angle: Math.random() * 360
        }
      ]);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {sparks.map(spark => (
        <motion.div
          key={spark.id}
          initial={{ opacity: 1, scale: 0 }}
          animate={{ 
            opacity: 0, 
            scale: 1.5,
            x: Math.cos(spark.angle) * 100,
            y: Math.sin(spark.angle) * 100
          }}
          transition={{ duration: 0.8 }}
          className="spark-particle"
          style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
        />
      ))}
    </div>
  );
};

const LoadingAnimation = () => {
  const [logIndex, setLogIndex] = useState(0);
  const logs = [
    "正在建立后端握手协议...",
    "正在上传多模态数据包...",
    "正在提取焊缝视觉特征...",
    "正在进行熔池动力学仿真...",
    "正在检索工艺知识库...",
    "正在生成诊断报告..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % logs.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-12 glass-panel orange-glow max-w-md w-full">
      <div className="relative w-40 h-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-welding-orange/10 border-t-welding-orange rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-4 border-welding-blue/10 border-t-welding-blue rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <UploadCloud className="w-12 h-12 text-welding-blue" />
        </motion.div>
        <SparkEffect />
      </div>
      <div className="text-center space-y-4 w-full">
        <motion.p
          key={logIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-welding-orange font-mono tracking-widest uppercase text-sm h-6"
        >
          {logs[logIndex]}
        </motion.p>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-welding-blue to-welding-orange"
          />
        </div>
        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-tighter">
          Backend Analysis Engine: ACTIVE | Data Stream: ENCRYPTED
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const [stage, setStage] = useState<'landing' | 'chat'>('landing');
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; files?: string[] }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  const handleStart = () => {
    setStage('chat');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => {
      let type: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      if (file.type.startsWith('video/')) type = 'video';
      
      return {
        file,
        preview: URL.createObjectURL(file),
        type
      };
    });
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isAnalyzing) return;

    const userMsg = input;
    const currentAttachments = [...attachments];
    
    setInput('');
    setAttachments([]);
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg, 
      files: currentAttachments.map(a => a.preview) 
    }]);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('message', userMsg);
      currentAttachments.forEach(att => {
        formData.append('files', att.file);
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.text || '分析完成。' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ 无法连接到后端分析服务器。请确保后端服务已启动。' 
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-industrial-gray relative overflow-hidden">
      {/* High-Tech Overlays */}
      <div className="crt-overlay" />
      <div className="scanline" />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,0,0.05),transparent_70%)]" />
      
      <AnimatePresence mode="wait">
        {stage === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6 z-10"
          >
            <div className="relative mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="w-48 h-48 rounded-full bg-gradient-to-tr from-welding-orange to-orange-400 flex items-center justify-center orange-glow"
              >
                <Flame className="w-24 h-24 text-white" />
              </motion.div>
              <SparkEffect />
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-center tracking-tighter mb-4"
            >
              焊接工艺助手 <span className="text-welding-orange">PRO</span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-center max-w-md mb-12 leading-relaxed"
            >
              工业级全栈分析系统。支持图像识别、视频缺陷检测与多维工艺仿真。
              数据实时同步后端，为您提供精准的焊接决策支持。
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="group relative px-8 py-4 bg-welding-orange text-white font-bold rounded-full overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,107,0,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                进入控制台 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col h-full max-w-6xl mx-auto w-full p-4 lg:p-8 z-10"
          >
            {/* Header */}
            <header className="flex items-center justify-between mb-8 glass-panel p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-welding-orange flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-none">后端同步控制台</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Backend Connected</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400">
                  <History className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
              {/* Sidebar Stats (Desktop) */}
              <aside className="hidden lg:flex flex-col gap-4 w-64">
                <div className="glass-panel p-4 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
                    <span>后端状态</span>
                    <Activity className="w-3 h-3" />
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'API 延迟', val: '12ms', color: 'bg-welding-blue' },
                      { label: '文件通道', val: 'Open', color: 'bg-green-500' },
                      { label: '分析引擎', val: 'v1.5-Flash', color: 'bg-welding-orange' },
                    ].map(stat => (
                      <div key={stat.label}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>{stat.label}</span>
                          <span>{stat.val}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            className={cn("h-full", stat.color)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-panel p-4 flex-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase mb-4">
                    <Terminal className="w-3 h-3" />
                    <span>传输日志</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 space-y-2">
                    <p>{`> 建立 WebSocket 握手...`}</p>
                    <p>{`> 挂载 /api/chat 路由...`}</p>
                    <p>{`> 准备接收多模态数据。`}</p>
                  </div>
                </div>
              </aside>

              {/* Chat Area */}
              <main className="flex-1 flex flex-col glass-panel overflow-hidden relative">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {messages.length === 0 && !isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                      <UploadCloud className="w-12 h-12 text-welding-blue" />
                      <p className="text-sm">上传焊缝照片、视频或工艺文件<br/>后端将为您进行深度视觉分析与参数诊断</p>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-welding-orange text-white rounded-tr-none" 
                          : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                      )}>
                        {msg.files && msg.files.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {msg.files.map((url, idx) => (
                              <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-white/20 bg-black/20">
                                <img src={url} alt="upload" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.role === 'assistant' ? (
                          <div className="markdown-body prose prose-invert prose-sm max-w-none">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono uppercase">
                        {msg.role === 'user' ? 'User' : 'Backend Assistant'}
                      </span>
                    </motion.div>
                  ))}

                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-20 bg-industrial-gray/80 backdrop-blur-sm flex items-center justify-center"
                    >
                      <LoadingAnimation />
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {attachments.map((att, i) => (
                        <div key={i} className="relative group">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-welding-orange/50 bg-black/40 flex items-center justify-center">
                            {att.type === 'image' ? (
                              <img src={att.preview} className="w-full h-full object-cover" />
                            ) : att.type === 'video' ? (
                              <Video className="w-6 h-6 text-welding-blue" />
                            ) : (
                              <FileText className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <button 
                            onClick={() => removeAttachment(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <form 
                    onSubmit={handleSubmit}
                    className="relative flex items-center gap-3"
                  >
                    <input 
                      type="file" 
                      multiple 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 hover:bg-white/10 text-slate-400 rounded-xl transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="描述工艺问题或上传文件分析..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-welding-orange transition-colors placeholder:text-slate-600"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isAnalyzing || (!input.trim() && attachments.length === 0)}
                      className="p-3 bg-welding-orange text-white rounded-xl hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:hover:shadow-none transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </main>
            </div>

            {/* Footer Stats */}
            <footer className="mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-widest px-2">
              <div className="flex gap-6">
                <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-yellow-500" /> 数据加密传输中</span>
                <span>MAX UPLOAD: 50MB</span>
              </div>
              <div className="flex gap-4">
                <span>NODE_ENV: PRODUCTION</span>
                <span>V: 3.1.0-FULLSTACK</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
