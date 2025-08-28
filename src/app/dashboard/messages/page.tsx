'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  timestamp: string
  isOwn: boolean
}

interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_email: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const initializeMessages = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Mock conversations data
        const mockConversations: Conversation[] = [
          {
            id: 'conv1',
            participant_id: 'user1',
            participant_name: 'John Doe',
            participant_email: 'sponsor@example.com',
            last_message: 'Thanks for your interest in the property!',
            last_message_time: new Date().toISOString(),
            unread_count: 2
          },
          {
            id: 'conv2',
            participant_id: 'user2',
            participant_name: 'Jane Smith',
            participant_email: 'investor@example.com',
            last_message: 'When can we schedule a call?',
            last_message_time: new Date(Date.now() - 3600000).toISOString(),
            unread_count: 0
          }
        ]
        setConversations(mockConversations)

        // Set up real-time subscription for new messages
        const messagesSubscription = supabase
          .channel('messages')
          .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' }, 
            (payload) => {
              const newMessage = payload.new as any
              if (newMessage.conversation_id === activeConversation) {
                setMessages(prev => [...prev, {
                  id: newMessage.id,
                  content: newMessage.content,
                  sender_id: newMessage.sender_id,
                  sender_name: newMessage.sender_name || 'Unknown',
                  timestamp: newMessage.created_at,
                  isOwn: newMessage.sender_id === user?.id
                }])
              }
            }
          )
          .subscribe()

        return () => {
          messagesSubscription.unsubscribe()
        }
      } catch (error) {
        toast.error('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    initializeMessages()
  }, [supabase, activeConversation, user?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async (conversationId: string) => {
    // Mock messages for the conversation
    const mockMessages: Message[] = [
      {
        id: 'msg1',
        content: 'Hi, I\'m interested in your investment opportunity.',
        sender_id: user?.id || 'current_user',
        sender_name: 'You',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isOwn: true
      },
      {
        id: 'msg2',
        content: 'Thanks for your interest! I\'d be happy to discuss the details with you.',
        sender_id: 'user1',
        sender_name: 'John Doe',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isOwn: false
      },
      {
        id: 'msg3',
        content: 'Great! What\'s the minimum investment amount?',
        sender_id: user?.id || 'current_user',
        sender_name: 'You',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isOwn: true
      },
      {
        id: 'msg4',
        content: 'The minimum investment is $50,000. We also have detailed financial projections available.',
        sender_id: 'user1',
        sender_name: 'John Doe',
        timestamp: new Date().toISOString(),
        isOwn: false
      }
    ]
    setMessages(mockMessages)
  }

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId)
    loadMessages(conversationId)
    
    // Mark conversation as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    )
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    try {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender_id: user?.id || 'current_user',
        sender_name: 'You',
        timestamp: new Date().toISOString(),
        isOwn: true
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')

      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation
            ? { ...conv, last_message: newMessage, last_message_time: new Date().toISOString() }
            : conv
        )
      )

      // In real implementation, send to API and Supabase will handle real-time updates
      // await supabase.from('messages').insert([{
      //   conversation_id: activeConversation,
      //   content: newMessage,
      //   sender_id: user.id
      // }])
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  if (loading) {
    return <div>Loading messages...</div>
  }

  const activeConv = conversations.find(c => c.id === activeConversation)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">
          Real-time messaging with your network
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {conversation.participant_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm truncate">
                          {conversation.participant_name}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.last_message_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages View */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {activeConv ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {activeConv.participant_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3>{activeConv.participant_name}</h3>
                    <p className="text-sm text-gray-600 font-normal">
                      {activeConv.participant_email}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p>Choose a conversation from the left to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}