import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Edit2, Trash2, X, Check } from 'lucide-react';

import ConfirmModal from './ConfirmModal';

const Inbox = ({ user, tickets, updateTicketStatus, clearChat }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageIdx, setEditingMessageIdx] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filter out tickets where the user has cleared the chat
  const relevantTickets = tickets.filter(t => !t.clearedChatFor?.includes(user.employeeId));

  // Keep selected ticket messages in sync with global tickets
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) {
        if (updated.clearedChatFor?.includes(user.employeeId)) {
          setSelectedTicket(null); // Deselect if chat was just cleared
        } else {
          setSelectedTicket(updated);
        }
      }
    }
  }, [tickets, selectedTicket?.id, user.employeeId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    const message = {
      from: user.role === 'Manager' ? 'Manager' : user.role === 'Technician' ? 'Technician' : user.name,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    updateTicketStatus(selectedTicket.id, {
      messages: [...(selectedTicket.messages || []), message]
    });
    
    setNewMessage('');
  };

  const handleDeleteMessage = (idx) => {
    if (!selectedTicket) return;
    const updatedMessages = [...selectedTicket.messages];
    updatedMessages.splice(idx, 1);
    updateTicketStatus(selectedTicket.id, { messages: updatedMessages });
  };

  const handleClearChat = () => {
    if (!selectedTicket || !clearChat) return;
    setShowConfirmModal(true);
  };

  const confirmClearChat = () => {
    if (!selectedTicket || !clearChat) return;
    clearChat(selectedTicket.id);
  };

  const startEditing = (idx, text) => {
    setEditingMessageIdx(idx);
    setEditMessageText(text);
  };

  const handleSaveEdit = (idx) => {
    if (!selectedTicket || !editMessageText.trim()) return;
    const updatedMessages = [...selectedTicket.messages];
    updatedMessages[idx].text = editMessageText;
    updateTicketStatus(selectedTicket.id, { messages: updatedMessages });
    setEditingMessageIdx(null);
    setEditMessageText('');
  };

  const cancelEdit = () => {
    setEditingMessageIdx(null);
    setEditMessageText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[600px] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
    >
      {/* Sidebar - Ticket List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Inbox
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {relevantTickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            >
              <div className="font-semibold text-slate-900">{ticket.id}</div>
              <div className="text-sm text-slate-500 truncate">{ticket.description}</div>
              <div className="text-xs text-slate-400 mt-1">Reporter: {ticket.employeeName}</div>
              {ticket.technicianName && <div className="text-xs text-slate-400">Tech: {ticket.technicianName}</div>}
            </button>
          ))}
          {relevantTickets.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-sm">No tickets available</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedTicket ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900">{selectedTicket.id}</h3>
                <p className="text-sm text-slate-500">{selectedTicket.description}</p>
              </div>
              <button onClick={handleClearChat} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold text-sm transition-colors flex items-center">
                <Trash2 className="w-4 h-4 mr-1" />
                Clear Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((msg, idx) => {
                  const isMe = msg.from === user.name || msg.from === user.role || (user.role === 'Manager' && msg.from === 'Manager') || (user.role === 'Technician' && msg.from === 'Technician');
                  const isEditing = editingMessageIdx === idx;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs opacity-75 font-semibold">{msg.from}</span>
                            {isMe && !isEditing && (
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                    <button onClick={() => startEditing(idx, msg.text)} className="hover:text-blue-200" title="Edit">
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDeleteMessage(idx)} className="hover:text-red-300" title="Delete">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {isEditing ? (
                            <div className="flex flex-col space-y-2 mt-1">
                                <input
                                    type="text"
                                    value={editMessageText}
                                    onChange={(e) => setEditMessageText(e.target.value)}
                                    className="px-2 py-1 text-slate-800 rounded outline-none w-full"
                                    autoFocus
                                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                                />
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => handleSaveEdit(idx)} className="p-1 bg-emerald-500 hover:bg-emerald-600 rounded text-white"><Check className="w-3 h-3"/></button>
                                    <button onClick={cancelEdit} className="p-1 bg-slate-400 hover:bg-slate-500 rounded text-white"><X className="w-3 h-3"/></button>
                                </div>
                            </div>
                        ) : (
                            <div>{msg.text}</div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{msg.time} {msg.edited ? '(edited)' : ''}</div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
            <div className="p-4 bg-white border-t border-slate-200 flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p>Select a ticket to view messages</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Clear Chat History?"
        message="Are you sure you want to clear this chat? This will hide it from your inbox until a new message arrives."
        type="warning"
        onConfirm={confirmClearChat}
        onCancel={() => setShowConfirmModal(false)}
      />
    </motion.div>
  );
};

export default Inbox;
