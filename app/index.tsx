import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api } from '../lib/api';

type Message = { role: 'user' | 'assistant'; content: string };
type ChatResult = { conversation: { id: string }; answer: string };

export default function ChatView() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Namaste. I am Rajen, your GPSC AI tool. Ask me anything and I will guide you step by step.' }]);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset>();
  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission needed', 'Photo aur video choose karne ke liye media library permission allow karein.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.8, videoMaxDuration: 60 });
    if (!result.canceled) setMedia(result.assets[0]);
  };
  const ask = async (preset?: string) => {
    const text = (preset || draft).trim(); if (!text || sending) return;
    setDraft(''); setError(''); setMessages((m) => [...m, { role: 'user', content: text }]); setSending(true);
    try { const r = await api<ChatResult>('POST', '/api/chat', { message: text, conversationId }); setConversationId(r.conversation.id); setMessages((m) => [...m, { role: 'assistant', content: r.answer }]); }
    catch (e) { setError((e as Error).message); }
    finally { setSending(false); }
  };
  return <SafeAreaView style={s.screen}><KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={s.header}><View><Text style={s.brand}>Rajen</Text><Text style={s.sub}>GPSC AI TOOL</Text></View><View style={s.actions}><Pressable onPress={() => router.push('/history')} style={s.icon} accessibilityRole="button" accessibilityLabel="History"><Ionicons name="time-outline" size={22} color="#e2e8f0" /></Pressable><Pressable onPress={() => router.push('/topics')} style={s.icon} accessibilityRole="button" accessibilityLabel="Topics"><Ionicons name="grid-outline" size={21} color="#e2e8f0" /></Pressable><Pressable onPress={() => router.push('/settings')} style={s.icon} accessibilityRole="button" accessibilityLabel="Settings"><Ionicons name="settings-outline" size={21} color="#e2e8f0" /></Pressable></View></View>
    <ScrollView contentContainerStyle={s.chat}>{messages.map((m, i) => <View key={i} style={[s.bubble, m.role === 'user' ? s.user : s.ai]}><Text style={[s.message, m.role === 'user' && s.userText]}>{m.content}</Text></View>)}{sending && <View style={[s.bubble, s.ai]}><ActivityIndicator color="#38bdf8" /></View>}{!!error && <Text style={s.error}>{error}</Text>}</ScrollView>
    <View style={s.suggestions}><Pressable onPress={() => ask('Help me make a GPSC study plan step by step.')} style={s.chip} accessibilityRole="button"><Text style={s.chipText}>Study plan</Text></Pressable><Pressable onPress={() => ask('Explain GPSC preparation strategy for beginners.')} style={s.chip} accessibilityRole="button"><Text style={s.chipText}>Beginner guide</Text></Pressable></View>
    {!!media && <View style={s.mediaReady}><Ionicons name={media.type === 'video' ? 'videocam' : 'image'} size={18} color="#38bdf8" /><Text style={s.mediaText} numberOfLines={1}>{media.fileName || (media.type === 'video' ? 'Video selected' : 'Photo selected')}</Text><Pressable onPress={() => setMedia(undefined)} accessibilityLabel="Remove selected media"><Ionicons name="close-circle" size={22} color="#94a3b8" /></Pressable></View>}
    <View style={s.composer}><Pressable onPress={pickMedia} style={s.attach} accessibilityRole="button" accessibilityLabel="Upload photo or video"><Ionicons name="attach" size={23} color="#38bdf8" /></Pressable><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={() => ask()} placeholder="Ask Rajen about GPSC..." placeholderTextColor="#94a3b8" style={s.input} multiline /><Pressable onPress={() => ask()} style={[s.send, !draft.trim() && s.disabled]} accessibilityRole="button" accessibilityLabel="Send message"><Ionicons name="arrow-up" size={24} color="#0f172a" /></Pressable></View>
  </KeyboardAvoidingView></SafeAreaView>;
}
const s = StyleSheet.create({ screen:{flex:1,backgroundColor:'#0f172a'},flex:{flex:1},header:{padding:20,paddingTop:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderBottomColor:'#1e3a5f'},brand:{fontSize:27,fontWeight:'800',color:'#e2e8f0'},sub:{fontSize:11,color:'#38bdf8',letterSpacing:1.6,fontWeight:'700'},actions:{flexDirection:'row',gap:8},icon:{width:42,height:42,alignItems:'center',justifyContent:'center'},chat:{padding:18,gap:12,flexGrow:1},bubble:{maxWidth:'87%',borderRadius:18,padding:14},ai:{alignSelf:'flex-start',backgroundColor:'#172554'},user:{alignSelf:'flex-end',backgroundColor:'#38bdf8'},message:{fontSize:16,lineHeight:23,color:'#e2e8f0'},userText:{color:'#0f172a',fontWeight:'600'},suggestions:{paddingHorizontal:18,flexDirection:'row',gap:8},chip:{borderWidth:1,borderColor:'#38bdf8',borderRadius:18,paddingHorizontal:12,paddingVertical:8},chipText:{color:'#e2e8f0',fontSize:13},mediaReady:{marginHorizontal:16,paddingHorizontal:12,paddingVertical:10,borderRadius:12,backgroundColor:'#172554',flexDirection:'row',alignItems:'center',gap:8},mediaText:{flex:1,color:'#e2e8f0',fontSize:14},composer:{padding:16,flexDirection:'row',gap:10,alignItems:'flex-end'},attach:{height:50,width:44,alignItems:'center',justifyContent:'center'},input:{flex:1,minHeight:50,maxHeight:110,borderRadius:16,backgroundColor:'#e2e8f0',color:'#0f172a',paddingHorizontal:15,paddingVertical:12,fontSize:16},send:{height:50,width:50,borderRadius:25,backgroundColor:'#38bdf8',alignItems:'center',justifyContent:'center'},disabled:{opacity:.45},error:{color:'#fca5a5',fontSize:14} });
