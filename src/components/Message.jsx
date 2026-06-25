// components/Message.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function Message() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Messages Data
  const [messages, setMessages] = useState([
    // User - Aung Ko Lin
    {
      id: 1,
      chatId: 'user_1',
      sender: 'admin',
      text: 'Welcome to the platform! How can I help you today?',
      time: '10:30 AM',
      date: '2024-04-01',
      read: true,
      type: 'text'
    },
    {
      id: 2,
      chatId: 'user_1',
      sender: 'user_1',
      text: 'Thank you! I have a question about the booking system.',
      time: '10:32 AM',
      date: '2024-04-01',
      read: true,
      type: 'text'
    },
    {
      id: 3,
      chatId: 'user_1',
      sender: 'admin',
      text: 'Sure, what would you like to know?',
      time: '10:33 AM',
      date: '2024-04-01',
      read: true,
      type: 'text'
    },
    {
      id: 4,
      chatId: 'user_2',
      sender: 'user_2',
      text: 'Hello, I need help with my account verification.',
      time: 'Yesterday',
      date: '2024-03-31',
      read: false,
      type: 'text'
    },
    {
      id: 5,
      chatId: 'shareholder_1',
      sender: 'shareholder_1',
      text: 'When is the next shareholder meeting?',
      time: '2:15 PM',
      date: '2024-03-30',
      read: false,
      type: 'text'
    },
    {
      id: 6,
      chatId: 'shareholder_1',
      sender: 'admin',
      text: 'The meeting is scheduled for April 15th at 10:00 AM.',
      time: '2:20 PM',
      date: '2024-03-30',
      read: true,
      type: 'text'
    }
  ]);

  // Users Data with Images
  const [users, setUsers] = useState([
    {
      id: 1,
      fullName: 'Aung Ko Lin',
      email: 'aung.kol@example.com',
      phone: '09-123456789',
      role: 'Admin',
      status: 'Online',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      lastSeen: 'online',
      unreadCount: 0
    },
    {
      id: 2,
      fullName: 'Su Su Hlaing',
      email: 'su.hlaing@example.com',
      phone: '09-987654321',
      role: 'Manager',
      status: 'Online',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      lastSeen: 'online',
      unreadCount: 1
    },
    {
      id: 3,
      fullName: 'Min Thu Wun',
      email: 'min.thu@example.com',
      phone: '09-456789123',
      role: 'User',
      status: 'Offline',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      lastSeen: '2 hours ago',
      unreadCount: 0
    },
    {
      id: 4,
      fullName: 'Thida Win',
      email: 'thida.win@example.com',
      phone: '09-234567890',
      role: 'User',
      status: 'Offline',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      lastSeen: 'yesterday',
      unreadCount: 0
    },
    {
      id: 5,
      fullName: 'Kyaw Zaw',
      email: 'kyaw.zaw@example.com',
      phone: '09-345678901',
      role: 'User',
      status: 'Online',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      lastSeen: 'online',
      unreadCount: 0
    }
  ]);

  // Shareholders Data with Images
  const [shareholders, setShareholders] = useState([
    {
      id: 1,
      fullName: 'U Aung Ko Lin',
      email: 'aung.kol@shareholder.com',
      phone: '09-123456789',
      shareClass: 'Common',
      status: 'Online',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      lastSeen: 'online',
      unreadCount: 1
    },
    {
      id: 2,
      fullName: 'Daw Su Su Hlaing',
      email: 'su.hlaing@shareholder.com',
      phone: '09-987654321',
      shareClass: 'Preferred',
      status: 'Offline',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      lastSeen: '1 hour ago',
      unreadCount: 0
    },
    {
      id: 3,
      fullName: 'U Min Thu Wun',
      email: 'min.thu@shareholder.com',
      phone: '09-456789123',
      shareClass: 'Common',
      status: 'Offline',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      lastSeen: 'yesterday',
      unreadCount: 0
    },
    {
      id: 4,
      fullName: 'Daw Thida Win',
      email: 'thida.win@shareholder.com',
      phone: '09-234567890',
      shareClass: 'Common',
      status: 'Online',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      lastSeen: 'online',
      unreadCount: 0
    },
    {
      id: 5,
      fullName: 'U Kyaw Zaw',
      email: 'kyaw.zaw@shareholder.com',
      phone: '09-345678901',
      shareClass: 'Preferred',
      status: 'Offline',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      lastSeen: '3 hours ago',
      unreadCount: 0
    }
  ]);

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentList = () => {
    return activeTab === 'users' ? users : shareholders;
  };

  const getChatId = (chat) => {
    return `${activeTab.slice(0, -1)}_${chat.id}`;
  };

  const getChatMessages = () => {
    if (!selectedChat) return [];
    const chatId = getChatId(selectedChat);
    return messages.filter(m => m.chatId === chatId).sort((a, b) => 
      new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
    );
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    if (!selectedChat) return;

    const chatId = getChatId(selectedChat);
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toISOString().split('T')[0];

    const newMessage = {
      id: messages.length + 1,
      chatId: chatId,
      sender: 'admin',
      text: messageInput,
      time: time,
      date: date,
      read: true,
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    scrollToBottom();

    if (activeTab === 'users') {
      setUsers(users.map(user => 
        user.id === selectedChat.id ? { ...user, unreadCount: 0 } : user
      ));
    } else {
      setShareholders(shareholders.map(sh => 
        sh.id === selectedChat.id ? { ...sh, unreadCount: 0 } : sh
      ));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    const chatId = getChatId(chat);
    setMessages(messages.map(msg => 
      msg.chatId === chatId && msg.sender !== 'admin' 
        ? { ...msg, read: true } 
        : msg
    ));
    
    if (activeTab === 'users') {
      setUsers(users.map(user => 
        user.id === chat.id ? { ...user, unreadCount: 0 } : user
      ));
    } else {
      setShareholders(shareholders.map(sh => 
        sh.id === chat.id ? { ...sh, unreadCount: 0 } : sh
      ));
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && selectedChat) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const chatId = getChatId(selectedChat);
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = now.toISOString().split('T')[0];

        const newMessage = {
          id: messages.length + 1,
          chatId: chatId,
          sender: 'admin',
          text: '',
          image: reader.result,
          time: time,
          date: date,
          read: true,
          type: 'image'
        };
        setMessages([...messages, newMessage]);
        scrollToBottom();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(messageInput + emoji);
    setShowEmojiPicker(false);
  };

  const filteredList = getCurrentList().filter(item => {
    return item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusDot = (status) => {
    if (status === 'Online') return <span className="status-dot online"></span>;
    return <span className="status-dot offline"></span>;
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Messages" onThemeChange={handleThemeChange} />

      <div className="message-main-container">
        <div className="chat-container">
          {/* Left Sidebar - Chat List */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <div className="chat-tabs">
                <button 
                  className={`chat-tab ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('users');
                    setSelectedChat(null);
                    setSearchTerm('');
                  }}
                >
                  <i className="bi bi-people-fill"></i>
                  Users
                  {users.filter(u => u.unreadCount > 0).length > 0 && (
                    <span className="tab-badge">{users.filter(u => u.unreadCount > 0).length}</span>
                  )}
                </button>
                <button 
                  className={`chat-tab ${activeTab === 'shareholders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('shareholders');
                    setSelectedChat(null);
                    setSearchTerm('');
                  }}
                >
                  <i className="bi bi-person-badge-fill"></i>
                  Shareholders
                  {shareholders.filter(s => s.unreadCount > 0).length > 0 && (
                    <span className="tab-badge">{shareholders.filter(s => s.unreadCount > 0).length}</span>
                  )}
                </button>
              </div>
              <div className="chat-search">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="chat-list">
              {filteredList.map((chat) => (
                <div 
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="chat-avatar">
                    <img src={chat.avatar} alt={chat.fullName} />
                    {getStatusDot(chat.status)}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{chat.fullName}</div>
                    <div className="chat-preview">
                      {chat.status === 'Online' ? 'Online' : chat.lastSeen}
                    </div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="chat-badge">{chat.unreadCount}</div>
                  )}
                </div>
              ))}
              {filteredList.length === 0 && (
                <div className="empty-chat-list">
                  <i className="bi bi-chat-dots"></i>
                  <p>No {activeTab} found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="chat-area">
            {selectedChat ? (
              <>
                <div className="chat-header">
                  <div className="chat-header-info">
                    <div className="chat-avatar-large">
                      <img src={selectedChat.avatar} alt={selectedChat.fullName} />
                    </div>
                    <div className="chat-header-details">
                      <h3>{selectedChat.fullName}</h3>
                      <p>
                        {selectedChat.status === 'Online' ? (
                          <span className="online-text">● Online</span>
                        ) : (
                          `Last seen ${selectedChat.lastSeen}`
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="chat-header-actions">
                    <button className="chat-action-btn" title="Call">
                      <i className="bi bi-telephone-fill"></i>
                    </button>
                    <button className="chat-action-btn" title="Video Call">
                      <i className="bi bi-camera-video-fill"></i>
                    </button>
                    <button className="chat-action-btn" title="Info">
                      <i className="bi bi-info-circle-fill"></i>
                    </button>
                  </div>
                </div>

                <div className="chat-messages">
                  {getChatMessages().map((message, index) => {
                    const isAdmin = message.sender === 'admin';
                    const showDate = index === 0 || getChatMessages()[index - 1]?.date !== message.date;
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="message-date-divider">
                            <span>{message.date}</span>
                          </div>
                        )}
                        <div className={`message ${isAdmin ? 'message-out' : 'message-in'}`}>
                          {!isAdmin && (
                            <div className="message-avatar-small">
                              <img src={selectedChat.avatar} alt="" />
                            </div>
                          )}
                          <div className="message-bubble">
                            {message.type === 'image' ? (
                              <img src={message.image} alt="Shared" className="message-image" />
                            ) : (
                              <p>{message.text}</p>
                            )}
                            <span className="message-time">
                              {message.time}
                              {isAdmin && <i className="bi bi-check-check"></i>}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                  <button className="input-action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <i className="bi bi-emoji-smile"></i>
                  </button>
                  <button className="input-action-btn" onClick={handleFileUpload}>
                    <i className="bi bi-paperclip"></i>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="chat-input-wrapper">
                    <textarea
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows="1"
                    />
                  </div>
                  <button className="send-btn" onClick={handleSendMessage}>
                    <i className="bi bi-send-fill"></i>
                  </button>

                  {showEmojiPicker && (
                    <div className="emoji-picker">
                      <div className="emoji-list">
                        {['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '👍', '👎', '❤️', '🔥', '🎉', '✨', '⭐', '💯'].map(emoji => (
                          <button key={emoji} onClick={() => handleEmojiSelect(emoji)}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="chat-empty">
                <div className="chat-empty-content">
                  <i className="bi bi-chat-dots-fill"></i>
                  <h3>Select a conversation</h3>
                  <p>Choose a user or shareholder to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;