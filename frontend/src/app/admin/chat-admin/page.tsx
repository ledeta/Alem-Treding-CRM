'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Send, MoreVertical, Phone, Video, Paperclip, Plus, X, Users, Edit2, Trash2, ChevronLeft, Smile, Clock, CheckCheck, MessageCircle, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  chatId: string;
}

interface Chat {
  id: string;
  name: string;
  role?: 'admin' | 'sales';
  type: 'personal' | 'group';
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  online: boolean;
  messages: Message[];
  members?: string[];
  participants?: string[];
}

const STORAGE_KEY = 'chat_messages_storage';
const CHATS_KEY = 'all_chats_storage';

export default function ChatAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'group'>('personal');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupMembers, setEditGroupMembers] = useState<string[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock users data
  const MOCK_USERS = [
    {
      id: '1',
      username: 'admin',
      fullName: 'System Administrator',
      phone: '+251911223344',
      role: 'admin' as const,
      status: 'active',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      tasks: [],
    },
    {
      id: '2',
      username: 'sales',
      fullName: 'Sales Representative',
      phone: '+251922334455',
      role: 'sales' as const,
      status: 'active',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      tasks: [],
    },
    {
      id: '3',
      username: 'million',
      fullName: 'Million Tiruneh',
      phone: '+251945822091',
      role: 'admin' as const,
      status: 'active',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      tasks: [],
    },
  ];

  // Load messages from storage
  const loadMessagesFromStorage = (): Message[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save messages to storage
  const saveMessagesToStorage = (messages: Message[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving messages:', e);
    }
  };

  // Create personal chats from users
  const createPersonalChats = (): Chat[] => {
    return MOCK_USERS.map((u) => ({
      id: `personal_${u.id}`,
      name: u.fullName,
      role: u.role,
      type: 'personal',
      lastMessage: `Chat with ${u.fullName}`,
      timestamp: u.createdAt,
      unread: 0,
      avatar: u.fullName.charAt(0).toUpperCase(),
      online: Math.random() > 0.3,
      messages: [],
      participants: [user?.id || 'current', u.id],
    }));
  };

  // Default group chats
  const createDefaultGroups = (): Chat[] => {
    return [
      {
        id: 'group_1',
        name: 'Sales Team',
        type: 'group',
        lastMessage: 'Team discussion about Q3 targets',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        unread: 0,
        avatar: 'S',
        online: true,
        messages: [],
        members: ['1', '2'],
      },
      {
        id: 'group_2',
        name: 'Finance Department',
        type: 'group',
        lastMessage: 'Budget approval pending',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        unread: 2,
        avatar: 'F',
        online: true,
        messages: [],
        members: ['1', '3'],
      },
    ];
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(parsed);
      
      // Load all chats with persisted messages
      const allChats = [...createPersonalChats(), ...createDefaultGroups()];
      const storedMessages = loadMessagesFromStorage();
      
      // Attach stored messages to chats
      const chatsWithMessages = allChats.map(chat => ({
        ...chat,
        messages: storedMessages.filter(m => m.chatId === chat.id)
      }));
      
      setChats(chatsWithMessages);
      setSelectedChat('personal_1');
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  // Polling mechanism for real-time message sync with unread tracking
  useEffect(() => {
    const pollInterval = setInterval(() => {
      const storedMessages = loadMessagesFromStorage();
      setChats(prevChats => 
        prevChats.map(chat => {
          const chatMessages = storedMessages.filter(m => m.chatId === chat.id);
          
          // Count unread messages from other users
          const unreadCount = chatMessages.filter(m => !m.isOwn).length;
          
          return {
            ...chat,
            messages: chatMessages,
            unread: unreadCount,
          };
        })
      );
    }, 1000); // Poll every second for new messages

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat, chats]);

  // Clear unread notifications when opening a chat
  useEffect(() => {
    if (selectedChat) {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat ? { ...chat, unread: 0 } : chat
        )
      );
    }
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const currentChat = chats.find(c => c.id === selectedChat);
    if (!currentChat) return;

    // For personal chats, also add message to recipient's chat
    let targetChats = [selectedChat];
    
    if (currentChat.type === 'personal' && currentChat.participants) {
      // Find the corresponding personal chat for the recipient
      const recipientId = currentChat.participants.find(id => id !== user?.id);
      if (recipientId) {
        const recipientChatId = `personal_${recipientId}`;
        targetChats.push(recipientChatId);
      }
    }

    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender: user?.username || 'user',
      senderName: user?.fullName || 'You',
      text: messageInput,
      timestamp: new Date().toISOString(),
      isOwn: true,
      chatId: selectedChat,
    };

    // Update chats with new message - add to all relevant chats
    const updatedChats = chats.map((chat) => {
      if (targetChats.includes(chat.id)) {
        // For recipient's chat, mark message as not own
        const messageToAdd = chat.id === selectedChat 
          ? newMessage 
          : {
              ...newMessage,
              isOwn: false,
              chatId: chat.id,
            };
        
        // Clear unread for current chat only
        const newUnread = chat.id === selectedChat ? 0 : chat.unread + 1;
        
        return {
          ...chat,
          messages: [...chat.messages, messageToAdd],
          lastMessage: messageInput,
          timestamp: new Date().toISOString(),
          unread: newUnread,
        };
      }
      return chat;
    });

    setChats(updatedChats);
    
    // Persist all messages to storage
    const allMessages = updatedChats.flatMap(c => c.messages);
    saveMessagesToStorage(allMessages);
    
    setMessageInput('');
    setSuccessMessage('Message sent!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;

    const newGroup: Chat = {
      id: `group_${Date.now()}`,
      name: groupName,
      type: 'group',
      lastMessage: 'Group created',
      timestamp: new Date().toISOString(),
      unread: 0,
      avatar: groupName.charAt(0).toUpperCase(),
      online: true,
      messages: [],
      members: selectedMembers,
    };

    const updatedChats = [...chats, newGroup];
    setChats(updatedChats);
    
    // Save chats to storage
    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));
    } catch (e) {
      console.error('Error saving chats:', e);
    }
    
    setGroupName('');
    setSelectedMembers([]);
    setShowCreateGroup(false);
    setSelectedChat(newGroup.id);
    setSuccessMessage('Group created successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleEditGroup = (groupId: string) => {
    const group = chats.find((c) => c.id === groupId);
    if (group) {
      setEditingGroupId(groupId);
      setEditGroupName(group.name);
      setEditGroupMembers(group.members || []);
      setShowEditGroup(true);
      setShowMoreMenu(null);
    }
  };

  const handleSaveEdit = () => {
    if (!editGroupName.trim() || editGroupMembers.length === 0) return;

    const updatedChats = chats.map((chat) => {
      if (chat.id === editingGroupId) {
        return {
          ...chat,
          name: editGroupName,
          members: editGroupMembers,
        };
      }
      return chat;
    });

    setChats(updatedChats);
    
    // Persist updated chats
    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));
    } catch (e) {
      console.error('Error saving chats:', e);
    }
    
    setShowEditGroup(false);
    setEditingGroupId(null);
    setSuccessMessage('Group updated successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleDeleteGroup = (groupId: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== groupId);
    setChats(updatedChats);
    if (selectedChat === groupId) {
      setSelectedChat(updatedChats[0]?.id || null);
    }
    setShowMoreMenu(null);
  };

  const toggleEditMember = (memberId: string) => {
    setEditGroupMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const getGroupMemberDetails = (memberIds: string[] | undefined): any[] => {
    if (!memberIds) return [];
    return memberIds
      .map((id) => MOCK_USERS.find((user) => user.id === id))
      .filter((user) => user !== undefined);
  };

  const EMOJIS = ['😊', '😂', '😍', '🤣', '😘', '😭', '😱', '😎', '🤔', '😴', '❤️', '👍', '👎', '🔥', '⚡', '✨', '🎉', '🎊', '🥳', '🎈'];

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(messageInput + emoji);
    setShowEmojiPicker(false);
  };

  const filteredChats = chats
    .filter((chat) => chat.type === activeTab)
    .filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const currentChat = chats.find((chat) => chat.id === selectedChat);

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
          <p style={{ fontSize: '1.1rem', margin: 0 }}>Loading Chat...</p>
        </div>
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <>
      {/* Success Notification */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
          zIndex: 2000,
          animation: 'slideInRight 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{ fontSize: '1.2rem' }}>✓</div>
          <span style={{ fontWeight: '600' }}>{successMessage}</span>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        height: '100%',
        background: '#f5f5f7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}>
        {/* Sidebar - Chats List */}
        <div style={{
          width: isMobile ? (selectedChat ? '0px' : '100%') : '360px',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          borderRight: !isMobile ? '1px solid #e5e7eb' : 'none',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          position: isMobile ? 'absolute' : 'relative',
          left: 0,
          top: 0,
          height: '100%',
          zIndex: selectedChat && isMobile ? 0 : 10,
          boxShadow: isMobile ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
        }}>
          {/* Premium Header */}
          <div style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
            padding: '1.25rem',
            color: 'white',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                margin: 0,
                letterSpacing: '-0.5px',
              }}>
                Messages
              </h1>
              <button
                onClick={() => setShowCreateGroup(!showCreateGroup)}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Create new group"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.7)',
              }} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.75rem',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '0.95rem',
                  background: 'rgba(255,255,255,0.2)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            background: '#ffffff',
          }}>
            <button
              onClick={() => setActiveTab('personal')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: activeTab === 'personal'
                  ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                  : '#f5f5f7',
                color: activeTab === 'personal' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'personal') {
                  e.currentTarget.style.background = '#eeeeee';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'personal') {
                  e.currentTarget.style.background = '#f5f5f7';
                }
              }}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveTab('group')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: activeTab === 'group'
                  ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                  : '#f5f5f7',
                color: activeTab === 'group' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'group') {
                  e.currentTarget.style.background = '#eeeeee';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'group') {
                  e.currentTarget.style.background = '#f5f5f7';
                }
              }}
            >
              Groups
            </button>
          </div>

          {/* Chats List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            background: '#ffffff',
            paddingTop: '0.5rem',
          }}>
            {filteredChats.length === 0 ? (
              <div style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.95rem',
              }}>
                <MessageCircle size={40} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No {activeTab} chats yet</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: selectedChat === chat.id
                      ? 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(217,70,239,0.1) 100%)'
                      : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.25s ease',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    borderLeft: selectedChat === chat.id ? '3px solid #a855f7' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedChat !== chat.id) {
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedChat !== chat.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Avatar with Status */}
                  <div style={{
                    position: 'relative',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: chat.type === 'group'
                        ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1.2rem',
                      boxShadow: '0 2px 8px rgba(168,85,247,0.2)',
                    }}>
                      {chat.type === 'group' ? <Users size={24} strokeWidth={2} /> : chat.avatar}
                    </div>
                    {chat.online && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2.5px solid white',
                        boxShadow: '0 0 0 1px #e5e7eb',
                      }} />
                    )}
                  </div>

                  {/* Chat Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.375rem',
                      gap: '0.75rem',
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#111827',
                        fontSize: '0.95rem',
                      }}>
                        {chat.name}
                      </div>
                      {chat.type === 'personal' && chat.role && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.625rem',
                          background: chat.role === 'admin'
                            ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                            : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                          color: chat.role === 'admin' ? '#1e40af' : '#166534',
                          borderRadius: '6px',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          {chat.role}
                        </div>
                      )}
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        flexShrink: 0,
                      }}>
                        {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: chat.unread > 0 ? '#374151' : '#9ca3af',
                      fontWeight: chat.unread > 0 ? '500' : '400',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {chat.lastMessage}
                    </div>
                  </div>

                  {/* Unread Badge */}
                  {chat.unread > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(168,85,247,0.3)',
                    }}>
                      {chat.unread}
                    </div>
                  )}

                  {/* More Menu for Groups */}
                  {chat.type === 'group' && (
                    <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMoreMenu(showMoreMenu === chat.id ? null : chat.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.375rem',
                          color: '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          borderRadius: '50%',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                          e.currentTarget.style.color = '#6b7280';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#9ca3af';
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {showMoreMenu === chat.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          background: 'white',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                          zIndex: 50,
                          minWidth: '140px',
                          overflow: 'hidden',
                          marginTop: '0.5rem',
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGroup(chat.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              width: '100%',
                              padding: '0.875rem 1rem',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              color: '#374151',
                              borderBottom: '1px solid #f3f4f6',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(chat.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              width: '100%',
                              padding: '0.875rem 1rem',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              color: '#ef4444',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fef2f2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {currentChat ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            position: isMobile ? 'fixed' : 'relative',
            left: isMobile ? 0 : 'auto',
            top: isMobile ? 0 : 'auto',
            width: isMobile ? '100%' : 'auto',
            height: isMobile ? '100vh' : '100%',
            zIndex: isMobile ? 20 : 'auto',
            overflow: 'hidden',
          }}>
            {/* Premium Chat Header */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                {/* Mobile Back Button */}
                {isMobile && (
                  <button
                    onClick={() => setSelectedChat(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a855f7',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                {/* Avatar */}
                <div style={{
                  position: 'relative',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: currentChat.type === 'group'
                      ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    boxShadow: '0 2px 8px rgba(168,85,247,0.2)',
                  }}>
                    {currentChat.type === 'group' ? <Users size={24} strokeWidth={2} /> : currentChat.avatar}
                  </div>
                  {currentChat.online && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid white',
                      boxShadow: '0 0 0 1px #e5e7eb',
                    }} />
                  )}
                </div>

                {/* Chat Info */}
                <div>
                  <div style={{
                    fontWeight: '700',
                    color: '#111827',
                    fontSize: '1rem',
                    marginBottom: '0.25rem',
                  }}>
                    {currentChat.name}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#9ca3af',
                  }}>
                    {currentChat.type === 'group'
                      ? `${currentChat.members?.length || 0} members`
                      : (currentChat.online ? '🟢 Online' : '🔘 Offline')}
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center',
              }}>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.625rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Start call"
                >
                  <Phone size={20} />
                </button>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.625rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Start video call"
                >
                  <Video size={20} />
                </button>
                {currentChat.type === 'group' && (
                  <button
                    onClick={() => setShowGroupMembers(!showGroupMembers)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.625rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a855f7',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Show members"
                  >
                    <Users size={20} />
                  </button>
                )}
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.625rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="More options"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: '#ffffff',
              minHeight: '400px',
            }}>
              {currentChat.messages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#9ca3af',
                  fontSize: '0.95rem',
                }}>
                  <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                    animation: 'fadeIn 0.3s ease',
                  }}
                >
                  <div style={{
                    maxWidth: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.isOwn ? 'flex-end' : 'flex-start',
                  }}>
                    {!message.isOwn && currentChat.type === 'group' && (
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        marginBottom: '0.375rem',
                        paddingLeft: '0.5rem',
                      }}>
                        {message.senderName}
                      </div>
                    )}
                    <div style={{
                      padding: '0.875rem 1.125rem',
                      borderRadius: message.isOwn ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                      background: message.isOwn
                        ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                        : '#f3f4f6',
                      color: message.isOwn ? 'white' : '#111827',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      wordWrap: 'break-word',
                      boxShadow: message.isOwn
                        ? '0 4px 12px rgba(168,85,247,0.2)'
                        : '0 2px 8px rgba(0,0,0,0.04)',
                    }}>
                      {message.text}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      marginTop: '0.375rem',
                      paddingLeft: message.isOwn ? '0' : '0.5rem',
                      paddingRight: message.isOwn ? '0.5rem' : '0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      <Clock size={12} />
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {message.isOwn && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              ))
              )}

              {typingIndicator && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#a855f7',
                    animation: 'bounce 1.4s infinite',
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#a855f7',
                    animation: 'bounce 1.4s infinite 0.2s',
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#a855f7',
                    animation: 'bounce 1.4s infinite 0.4s',
                  }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-end',
              background: '#ffffff',
              position: 'relative',
              flexShrink: 0,
              width: '100%',
              boxSizing: 'border-box',
              zIndex: 50,
            }}>
              <button style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a855f7',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: showEmojiPicker ? '#a855f7' : '#a855f7',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Add emoji"
              >
                <Smile size={20} />
              </button>

              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '24px',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  background: '#f9fafb',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  resize: 'none',
                  maxHeight: '100px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a855f7';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#f9fafb';
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                style={{
                  padding: '0.625rem',
                  background: messageInput.trim()
                    ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                    : '#e5e7eb',
                  color: messageInput.trim() ? 'white' : '#d1d5db',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxShadow: messageInput.trim() ? '0 4px 12px rgba(168,85,247,0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (messageInput.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (messageInput.trim()) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                title="Send message"
              >
                <Send size={20} strokeWidth={2.5} />
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '0.75rem',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.12)',
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gap: '0.5rem',
                  maxWidth: '360px',
                  zIndex: 100,
                  border: '1px solid #e5e7eb',
                }}>
                  {EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        padding: '0.625rem',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.transform = 'scale(1.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            background: '#ffffff',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(217,70,239,0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageCircle size={40} strokeWidth={1.5} style={{ color: '#a855f7', opacity: 0.5 }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: '600', color: '#111827' }}>
                Select a chat to start
              </p>
              <p style={{ fontSize: '0.95rem', margin: '0.5rem 0 0 0', color: '#9ca3af' }}>
                Choose from your conversations or create a new group
              </p>
            </div>
          </div>
        )}

        {/* Group Members Panel */}
        {showGroupMembers && currentChat?.type === 'group' && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: isMobile ? '100%' : '360px',
            background: 'white',
            borderLeft: !isMobile ? '1px solid #e5e7eb' : 'none',
            boxShadow: !isMobile ? '-4px 0 16px rgba(0, 0, 0, 0.08)' : '0 -4px 16px rgba(0, 0, 0, 0.08)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.3s ease',
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
              color: 'white',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '700',
              }}>
                Members ({getGroupMemberDetails(currentChat.members).length})
              </h3>
              <button
                onClick={() => setShowGroupMembers(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '1.5rem',
                  padding: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Members List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {getGroupMemberDetails(currentChat.members).length === 0 ? (
                <div style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '0.95rem',
                }}>
                  No members yet
                </div>
              ) : (
                getGroupMemberDetails(currentChat.members).map((member) => (
                  <div
                    key={member.id}
                    style={{
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}>
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#111827',
                        fontSize: '0.9rem',
                      }}>
                        {member.fullName}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#9ca3af',
                      }}>
                        {member.role}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Group Modals */}
        {(showCreateGroup || showEditGroup) && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.2s ease',
            }}
            onClick={() => {
              setShowCreateGroup(false);
              setShowEditGroup(false);
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '420px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
                maxHeight: '85vh',
                overflowY: 'auto',
                animation: 'slideUp 0.3s ease',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.75rem',
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {showEditGroup ? 'Edit Group' : 'Create Group'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateGroup(false);
                    setShowEditGroup(false);
                  }}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '1.5rem',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.625rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={showEditGroup ? editGroupName : groupName}
                  onChange={(e) =>
                    showEditGroup
                      ? setEditGroupName(e.target.value)
                      : setGroupName(e.target.value)
                  }
                  placeholder="Enter group name"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#a855f7';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Select Members
                </label>
                <div style={{
                  maxHeight: '240px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  {MOCK_USERS.map((member) => (
                    <label
                      key={member.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.875rem',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          showEditGroup
                            ? editGroupMembers.includes(member.id)
                            : selectedMembers.includes(member.id)
                        }
                        onChange={() =>
                          showEditGroup
                            ? toggleEditMember(member.id)
                            : toggleMember(member.id)
                        }
                        style={{
                          cursor: 'pointer',
                          width: '18px',
                          height: '18px',
                          accentColor: '#a855f7',
                        }}
                      />
                      <div>
                        <div style={{
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          color: '#111827',
                        }}>
                          {member.fullName}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#9ca3af',
                        }}>
                          {member.role}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowCreateGroup(false);
                    setShowEditGroup(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={showEditGroup ? handleSaveEdit : handleCreateGroup}
                  disabled={
                    showEditGroup
                      ? !editGroupName.trim() || editGroupMembers.length === 0
                      : !groupName.trim() || selectedMembers.length === 0
                  }
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background:
                      showEditGroup
                        ? !editGroupName.trim() || editGroupMembers.length === 0
                          ? '#d1d5db'
                          : 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                        : !groupName.trim() || selectedMembers.length === 0
                        ? '#d1d5db'
                        : 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor:
                      showEditGroup
                        ? !editGroupName.trim() || editGroupMembers.length === 0
                          ? 'not-allowed'
                          : 'pointer'
                        : !groupName.trim() || selectedMembers.length === 0
                        ? 'not-allowed'
                        : 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (
                      !((showEditGroup && (!editGroupName.trim() || editGroupMembers.length === 0)) ||
                        (!showEditGroup && (!groupName.trim() || selectedMembers.length === 0)))
                    ) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(168,85,247,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {showEditGroup ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        * {
          box-sizing: border-box;
        }

        input::placeholder {
          color: inherit;
          opacity: 0.6;
        }
      `}</style>
    </>
  );
}
