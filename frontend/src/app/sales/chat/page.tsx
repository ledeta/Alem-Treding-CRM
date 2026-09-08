'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Send, MoreVertical, Phone, Video, Paperclip, Plus, X, Users, Edit2, Trash2, ChevronLeft, ChevronRight, Smile } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Chat {
  id: string;
  name: string;
  role?: 'admin' | 'sales';
  type: 'personal' | 'group';
  lastMessage: string;
  timestamp: Date;
  unread: number;
  avatar: string;
  online: boolean;
  messages: Message[];
  members?: string[];
}

export default function ChatSalesPage() {
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
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showChatsSidebar, setShowChatsSidebar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  // Create personal chats from users
  const createPersonalChats = (): Chat[] => {
    return MOCK_USERS.map((user) => ({
      id: `personal_${user.id}`,
      name: user.fullName,
      role: user.role,
      type: 'personal',
      lastMessage: `Start conversation with ${user.fullName} (${user.role})`,
      timestamp: new Date(user.createdAt),
      unread: 0,
      avatar: user.fullName.charAt(0).toUpperCase(),
      online: Math.random() > 0.3,
      messages: [
        {
          id: `m${user.id}_1`,
          sender: user.username,
          senderName: user.fullName,
          text: `Hello! I'm ${user.fullName} - ${user.role.toUpperCase()}`,
          timestamp: new Date(user.createdAt),
          isOwn: false,
        },
      ],
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
        timestamp: new Date(Date.now() - 3600000),
        unread: 0,
        avatar: 'S',
        online: true,
        messages: [
          {
            id: 'gm1',
            sender: 'sales',
            senderName: 'Sales Rep',
            text: 'Let\'s discuss Q3 targets',
            timestamp: new Date(Date.now() - 3600000),
            isOwn: false,
          },
        ],
        members: ['1', '2'],
      },
      {
        id: 'group_2',
        name: 'Finance Department',
        type: 'group',
        lastMessage: 'Budget approval pending',
        timestamp: new Date(Date.now() - 7200000),
        unread: 2,
        avatar: 'F',
        online: true,
        messages: [
          {
            id: 'gm2',
            sender: 'admin',
            senderName: 'Admin',
            text: 'Budget approval pending',
            timestamp: new Date(Date.now() - 7200000),
            isOwn: false,
          },
        ],
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
      if (parsed.role !== 'admin' && parsed.role !== 'sales') {
        router.push('/sales');
        return;
      }
      setUser(parsed);
      const allChats = [...createPersonalChats(), ...createDefaultGroups()];
      setChats(allChats);
      setSelectedChat('personal_1');
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat, chats]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const updatedChats = chats.map((chat) => {
      if (chat.id === selectedChat) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: `m${Date.now()}`,
              sender: 'you',
              senderName: 'You',
              text: messageInput,
              timestamp: new Date(),
              isOwn: true,
            },
          ],
          lastMessage: messageInput,
          timestamp: new Date(),
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setMessageInput('');
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;

    const newGroup: Chat = {
      id: `group_${Date.now()}`,
      name: groupName,
      type: 'group',
      lastMessage: 'Group created',
      timestamp: new Date(),
      unread: 0,
      avatar: groupName.charAt(0).toUpperCase(),
      online: true,
      messages: [
        {
          id: 'init_msg',
          sender: 'system',
          senderName: 'System',
          text: `${groupName} group created`,
          timestamp: new Date(),
          isOwn: false,
        },
      ],
      members: selectedMembers,
    };

    setChats([...chats, newGroup]);
    setGroupName('');
    setSelectedMembers([]);
    setShowCreateGroup(false);
    setSelectedChat(newGroup.id);
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
    setShowEditGroup(false);
    setEditingGroupId(null);
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

  const handleRemoveGroupMember = (memberId: string) => {
    if (!currentChat || currentChat.type !== 'group') return;

    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChat.id) {
        return {
          ...chat,
          members: chat.members?.filter((id) => id !== memberId) || [],
        };
      }
      return chat;
    });

    setChats(updatedChats);
  };

  const handleAddMembersToGroup = (memberIds: string[]) => {
    if (!currentChat || currentChat.type !== 'group') return;

    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChat.id) {
        const currentMembers = chat.members || [];
        const newMembers = [...new Set([...currentMembers, ...memberIds])];
        return {
          ...chat,
          members: newMembers,
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setShowAddMembers(false);
  };

  // Emoji data - 50 Important emojis
  const EMOJIS = [
    '😊', '😂', '😍', '🤣', '😘', '😭', '😱', '😎', '🤔', '😴',
    '😉', '😌', '😏', '🙂', '😔', '😪', '😤', '😡', '😠', '😈',
    '❤️', '💔', '💕', '💖', '💝', '💞', '💗', '💘', '💟', '�',
    '�👍', '👎', '👏', '�', '👋', '✋', '🤝', '👌', '💪', '🤲',
    '�🔥', '⚡', '✨', '�', '⭐', '🌟', '🎉', '🎊', '🥳', '🎈'
  ];

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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading Chat...</p>
      </div>
    );
  }

  // Mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const showChatContent = selectedChat && (isMobile ? true : true);
  const showChatListView = !selectedChat || (!isMobile);

  return (
    <>
      <div style={{
        display: 'flex',
        height: '100vh',
        background: '#fff',
        paddingBottom: isMobile ? '0' : '120px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
      }}>
        {/* Sidebar - Chats List - MOBILE: Hide when chat selected */}
        <div style={{
          width: isMobile ? (selectedChat ? '0px' : '100%') : '280px',
          background: '#fff',
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
        }}>
          {/* Header */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000', margin: 0 }}>Chats</h1>
              <button
                onClick={() => setShowCreateGroup(!showCreateGroup)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.375rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0084ff',
                  fontSize: '1.1rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999',
              }} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  background: '#f0f2f5',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = '#e4e6eb';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = '#f0f2f5';
                }}
              />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('personal')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: activeTab === 'personal' ? '#0084ff' : '#e4e6eb',
                  color: activeTab === 'personal' ? 'white' : '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveTab('group')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: activeTab === 'group' ? '#0084ff' : '#e4e6eb',
                  color: activeTab === 'group' ? 'white' : '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Groups
              </button>
            </div>
          </div>

          {/* Chats List */}
          <div style={{ flex: 1, overflowY: 'auto', paddingTop: '0.5rem' }}>
            {filteredChats.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
                No {activeTab} chats yet
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.5rem',
                    background: selectedChat === chat.id ? '#f0f2f5' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    transition: 'background 0.15s ease',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedChat !== chat.id) {
                      e.currentTarget.style.background = '#f2f2f2';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedChat !== chat.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: chat.type === 'group' 
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    position: 'relative',
                  }}>
                    {chat.type === 'group' && <Users size={20} strokeWidth={2.5} />}
                    {chat.type === 'personal' && chat.avatar}
                    {chat.online && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#31a24c',
                        border: '2px solid white',
                      }} />
                    )}
                  </div>

                  {/* Chat Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem', gap: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#000', fontSize: '0.9rem' }}>
                        {chat.name}
                      </div>
                      {chat.type === 'personal' && chat.role && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.2rem 0.5rem',
                          background: chat.role === 'admin' ? '#dbeafe' : '#dcfce7',
                          color: chat.role === 'admin' ? '#1e40af' : '#166534',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          {chat.role}
                        </div>
                      )}
                      {chat.type === 'group' && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.2rem 0.5rem',
                          background: '#f3e8ff',
                          color: '#7e22ce',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          Group
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: '#999', flexShrink: 0 }}>
                        {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: chat.unread > 0 ? '#000' : '#999',
                      fontWeight: chat.unread > 0 ? '500' : 'normal',
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
                      background: '#0084ff',
                      color: 'white',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      flexShrink: 0,
                    }}>
                      {chat.unread}
                    </div>
                  )}

                  {/* More Menu for Groups */}
                  {chat.type === 'group' && (
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMoreMenu(showMoreMenu === chat.id ? null : chat.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          color: '#999',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {showMoreMenu === chat.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          background: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 50,
                          minWidth: '120px',
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
                              padding: '0.75rem 1rem',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              color: '#000',
                              borderBottom: '1px solid #e5e7eb',
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
                              padding: '0.75rem 1rem',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              color: '#ef4444',
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

        {/* Edit Group Modal */}
        {showEditGroup && editingGroupId && (
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
            }}
            onClick={() => setShowEditGroup(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Edit Group</h2>
                <button
                  onClick={() => setShowEditGroup(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    fontSize: '1.5rem',
                    padding: 0,
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  placeholder="Enter group name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#0084ff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  Group Members
                </label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {MOCK_USERS.map((member) => (
                    <label
                      key={member.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                    >
                      <input
                        type="checkbox"
                        checked={editGroupMembers.includes(member.id)}
                        onChange={() => toggleEditMember(member.id)}
                        style={{
                          cursor: 'pointer',
                          width: '18px',
                          height: '18px',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{member.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{member.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowEditGroup(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#e5e7eb',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#d1d5db'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editGroupName.trim() || editGroupMembers.length === 0}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: !editGroupName.trim() || editGroupMembers.length === 0 ? '#d1d5db' : '#0084ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: !editGroupName.trim() || editGroupMembers.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (editGroupName.trim() && editGroupMembers.length > 0) {
                      e.currentTarget.style.background = '#0073e6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (editGroupName.trim() && editGroupMembers.length > 0) {
                      e.currentTarget.style.background = '#0084ff';
                    }
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroup && (
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
            }}
            onClick={() => setShowCreateGroup(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Create Group</h2>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    fontSize: '1.5rem',
                    padding: 0,
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#0084ff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  Select Members
                </label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {MOCK_USERS.map((member) => (
                    <label
                      key={member.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        style={{
                          cursor: 'pointer',
                          width: '18px',
                          height: '18px',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{member.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{member.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#e5e7eb',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#d1d5db'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: !groupName.trim() || selectedMembers.length === 0 ? '#d1d5db' : '#0084ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: !groupName.trim() || selectedMembers.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (groupName.trim() && selectedMembers.length > 0) {
                      e.currentTarget.style.background = '#0073e6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (groupName.trim() && selectedMembers.length > 0) {
                      e.currentTarget.style.background = '#0084ff';
                    }
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        {currentChat ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            position: 'relative',
            width: isMobile ? '100%' : 'auto',
            position: isMobile ? 'fixed' : 'relative',
            left: isMobile ? 0 : 'auto',
            top: isMobile ? 0 : 'auto',
            bottom: isMobile ? 0 : 'auto',
            right: isMobile ? 0 : 'auto',
            height: isMobile ? '100vh' : 'auto',
            zIndex: isMobile ? 20 : 'auto',
            overflow: isMobile ? 'hidden' : 'visible',
            paddingBottom: isMobile ? '80px' : '0',
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                {/* Mobile Back Button */}
                {isMobile && selectedChat && (
                  <button
                    onClick={() => setSelectedChat(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0084ff',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    title="Back to chats"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: currentChat.type === 'group'
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  {currentChat.type === 'group' && <Users size={16} strokeWidth={2.5} />}
                  {currentChat.type === 'personal' && currentChat.avatar}
                  {currentChat.online && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#31a24c',
                      border: '2px solid white',
                    }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#000', fontSize: '0.95rem' }}>
                    {currentChat.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}>
                    {currentChat.type === 'group' ? `${currentChat.members?.length || 0} members` : (currentChat.online ? 'Active now' : 'Offline')}
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0084ff',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Phone size={20} />
                </button>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0084ff',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Video size={20} />
                </button>
                {currentChat.type === 'group' && (
                  <>
                    <button
                      onClick={() => setShowGroupMembers(!showGroupMembers)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0084ff',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      title="Show members"
                    >
                      <Users size={20} />
                    </button>
                    <button
                      onClick={() => handleEditGroup(currentChat.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0084ff',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      title="Edit group"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this group?')) {
                          handleDeleteGroup(currentChat.id);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      title="Delete group"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0084ff',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '0.75rem' : '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '0.5rem' : '0.75rem',
              background: '#fff',
              minHeight: 0,
              maxHeight: isMobile ? 'calc(100vh - 240px)' : 'auto',
            }}>
              {currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div style={{
                    maxWidth: '55%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.isOwn ? 'flex-end' : 'flex-start',
                  }}>
                    {!message.isOwn && (
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#999',
                        marginBottom: '0.25rem',
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                      }}>
                        {message.senderName}
                      </div>
                    )}
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: message.isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      background: message.isOwn ? '#0084ff' : '#e4e6eb',
                      color: message.isOwn ? 'white' : '#000',
                      fontSize: '0.95rem',
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                    }}>
                      {message.text}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#999',
                      marginTop: '0.25rem',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                    }}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div style={{
              padding: isMobile ? '0.6rem 0.75rem' : '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: isMobile ? '0.5rem' : '0.75rem',
              alignItems: 'flex-end',
              background: '#fff',
              position: 'relative',
              flexShrink: 0,
              width: '100%',
              boxSizing: 'border-box',
              bottom: 0,
              zIndex: 100,
            }}>
              <button style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: isMobile ? '0.3rem' : '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0084ff',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Paperclip size={isMobile ? 16 : 20} />
              </button>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: isMobile ? '0.3rem' : '0.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: showEmojiPicker ? '#0084ff' : '#0084ff',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f2f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                title="Add emoji"
              >
                <Smile size={isMobile ? 16 : 20} />
              </button>

              <input
                type="text"
                placeholder="Aa"
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
                  padding: isMobile ? '0.5rem 0.8rem' : '0.75rem 1rem',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: isMobile ? '0.8rem' : '0.95rem',
                  fontFamily: 'inherit',
                  background: '#f0f2f5',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  resize: 'none',
                  maxHeight: '100px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = '#e4e6eb';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = '#f0f2f5';
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                style={{
                  padding: isMobile ? '0.3rem' : '0.5rem',
                  background: messageInput.trim() ? '#0084ff' : '#e4e6eb',
                  color: messageInput.trim() ? 'white' : '#ccc',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontWeight: '700',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (messageInput.trim()) {
                    e.currentTarget.style.background = '#0073e6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (messageInput.trim()) {
                    e.currentTarget.style.background = '#0084ff';
                  }
                }}
              >
                <Send size={isMobile ? 16 : 20} strokeWidth={2.5} />
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '0.75rem',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.15)',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gap: '0.5rem',
                  maxWidth: '340px',
                  zIndex: 100,
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
                        padding: '0.5rem',
                        borderRadius: '6px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f2f5';
                        e.currentTarget.style.transform = 'scale(1.2)';
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
            color: '#999',
            background: '#fff',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <MessageCircle size={64} strokeWidth={1} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Select a chat to start messaging</p>
          </div>
        )}

        {/* Group Members Panel */}
        {showGroupMembers && currentChat?.type === 'group' && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '320px',
            background: 'white',
            borderLeft: '1px solid #e5e7eb',
            boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.08)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: '120px',
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                Members ({getGroupMemberDetails(currentChat.members).length})
              </h3>
              <button
                onClick={() => setShowGroupMembers(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#999',
                  fontSize: '1.5rem',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Add Member Button */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setShowAddMembers(true)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0084ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0073e6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#0084ff'; }}
              >
                + Add Member
              </button>
            </div>

            {/* Members List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {getGroupMemberDetails(currentChat.members).length === 0 ? (
                <div style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '0.9rem',
                }}>
                  No members yet
                </div>
              ) : (
                getGroupMemberDetails(currentChat.members).map((member) => (
                  <div
                    key={member.id}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderBottom: '1px solid #f0f2f5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}>
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>

                    {/* Member Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        color: '#000',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {member.fullName}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.2rem 0.5rem',
                        background: member.role === 'admin' ? '#dbeafe' : '#dcfce7',
                        color: member.role === 'admin' ? '#1e40af' : '#166534',
                        borderRadius: '4px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        marginTop: '0.25rem',
                      }}>
                        {member.role}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveGroupMember(member.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      title="Remove member"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Add Members Modal */}
        {showAddMembers && currentChat?.type === 'group' && (
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
              zIndex: 1001,
            }}
            onClick={() => setShowAddMembers(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Add Members</h2>
                <button
                  onClick={() => setShowAddMembers(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    fontSize: '1.5rem',
                    padding: 0,
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  Select users to add
                </label>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {MOCK_USERS.map((user) => {
                    const isAlreadyMember = currentChat.members?.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          cursor: isAlreadyMember ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: isAlreadyMember ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isAlreadyMember) {
                            e.currentTarget.style.background = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isAlreadyMember) {
                            e.currentTarget.style.background = '#f9fafb';
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          disabled={isAlreadyMember}
                          checked={editGroupMembers.includes(user.id)}
                          onChange={() => {
                            if (!isAlreadyMember) {
                              toggleEditMember(user.id);
                            }
                          }}
                          style={{
                            cursor: isAlreadyMember ? 'not-allowed' : 'pointer',
                            width: '18px',
                            height: '18px',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#999' }}>
                            {isAlreadyMember ? 'Already in group' : user.role}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowAddMembers(false);
                    setEditGroupMembers([]);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#e5e7eb',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#d1d5db'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAddMembersToGroup(editGroupMembers);
                    setEditGroupMembers([]);
                  }}
                  disabled={editGroupMembers.length === 0}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: editGroupMembers.length === 0 ? '#d1d5db' : '#0084ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: editGroupMembers.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (editGroupMembers.length > 0) {
                      e.currentTarget.style.background = '#0073e6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (editGroupMembers.length > 0) {
                      e.currentTarget.style.background = '#0084ff';
                    }
                  }}
                >
                  Add ({editGroupMembers.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function MessageCircle({ size, strokeWidth, style }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
