import { format } from 'date-fns';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const exportAsMarkdown = (messages: Message[], title?: string): string => {
  const conversationTitle = title || `AI Conversation - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`;
  
  let markdown = `# ${conversationTitle}\n\n`;
  markdown += `*Exported on ${format(new Date(), 'MMMM d, yyyy at h:mm a')}*\n\n`;
  markdown += `---\n\n`;

  messages.forEach((message) => {
    const role = message.role === 'user' ? '👤 **You**' : '🤖 **hubAI**';
    const time = format(new Date(message.timestamp), 'h:mm a');
    
    markdown += `### ${role} *${time}*\n\n`;
    markdown += `${message.content}\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
};

export const exportAsText = (messages: Message[], title?: string): string => {
  const conversationTitle = title || `AI Conversation - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`;
  
  let text = `${conversationTitle}\n`;
  text += `${'='.repeat(conversationTitle.length)}\n\n`;
  text += `Exported on ${format(new Date(), 'MMMM d, yyyy at h:mm a')}\n\n`;

  messages.forEach((message) => {
    const role = message.role === 'user' ? 'You' : 'hubAI';
    const time = format(new Date(message.timestamp), 'h:mm a');
    
    text += `[${time}] ${role}:\n`;
    text += `${message.content}\n\n`;
  });

  return text;
};

export const exportAsJSON = (messages: Message[], title?: string): string => {
  const data = {
    title: title || `AI Conversation - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp).toISOString(),
    }))
  };
  
  return JSON.stringify(data, null, 2);
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportConversation = (
  messages: Message[], 
  format: 'markdown' | 'text' | 'json',
  title?: string
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const safeTitle = (title || 'conversation').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  
  switch (format) {
    case 'markdown':
      downloadFile(
        exportAsMarkdown(messages, title),
        `${safeTitle}_${timestamp}.md`,
        'text/markdown'
      );
      break;
    case 'text':
      downloadFile(
        exportAsText(messages, title),
        `${safeTitle}_${timestamp}.txt`,
        'text/plain'
      );
      break;
    case 'json':
      downloadFile(
        exportAsJSON(messages, title),
        `${safeTitle}_${timestamp}.json`,
        'application/json'
      );
      break;
  }
};
