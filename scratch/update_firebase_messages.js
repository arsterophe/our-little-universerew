import fs from 'fs';

let code = fs.readFileSync('firebase.js', 'utf8');

const messagesModuleCode = `

// ==============================================================================
// 12. MESSAGES & CONVERSATIONS (FASE 6)
// ==============================================================================

export const MESSAGES_COLLECTION = 'messages';
export const CONVERSATIONS_COLLECTION = 'conversations';

export const CONVERSATION_PARTICIPANTS = {
  lala_lele: ['lala', 'lele'],
  lala_nyanya: ['lala', 'nyanya'],
  lele_nyanya: ['lele', 'nyanya'],
  all_friends: ['lala', 'lele', 'nyanya']
};

export function getConversationId(charA, charB) {
  if (!charA || !charB) return 'all_friends';
  if (charA === 'all' || charB === 'all') return 'all_friends';
  return [charA, charB].sort().join('_');
}

/**
 * Sends a message in a conversation.
 * Validates authenticated sender, length, and non-empty content.
 */
export async function dbSendMessage({ conversationId, text, recipientCharacter } = {}, authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const convId = conversationId || (recipientCharacter ? getConversationId(verifiedChar, recipientCharacter) : 'all_friends');
  const participants = CONVERSATION_PARTICIPANTS[convId];
  if (!participants) {
    throw new Error(\`ID percakapan tidak valid: \${convId}\`);
  }

  if (!participants.includes(verifiedChar)) {
    throw new Error(\`Akses ditolak: Anda bukan partisipan dalam percakapan \${convId}.\`);
  }

  if (!text || typeof text !== 'string') {
    throw new Error('Pesan tidak boleh kosong.');
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    throw new Error('Pesan tidak boleh hanya berisi spasi.');
  }

  if (trimmedText.length > 2000) {
    throw new Error(\`Pesan terlalu panjang (\${trimmedText.length} karakter). Maksimal 2000 karakter.\`);
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const now = Date.now();
  const messageId = \`msg-\${now}-\${Math.random().toString(36).slice(2, 8)}\`;
  const charConfig = CHARACTER_AUTH_RULES[verifiedChar];

  const messagePayload = {
    id: messageId,
    conversationId: convId,
    senderUid: authUser.uid,
    senderCharacter: verifiedChar,
    senderName: charConfig?.name || verifiedChar,
    senderAvatar: charConfig?.avatar || '',
    participants,
    text: trimmedText,
    createdAt: now,
    readBy: {
      [verifiedChar]: true
    }
  };

  // 1. Write message to messages collection
  const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
  await setDoc(messageRef, messagePayload);

  // 2. Update conversation summary document
  try {
    const convRef = doc(db, CONVERSATIONS_COLLECTION, convId);
    await setDoc(convRef, {
      id: convId,
      participants,
      lastMessage: trimmedText.slice(0, 100),
      lastSender: verifiedChar,
      lastSenderUid: authUser.uid,
      lastMessageAt: now,
      updatedAt: now
    }, { merge: true });
  } catch (convErr) {
    console.warn('Gagal memperbarui ringkasan percakapan (non-fatal):', convErr);
  }

  return messagePayload;
}

/**
 * Fetches message history for a conversation.
 */
export async function dbFetchMessages(conversationId, authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const participants = CONVERSATION_PARTICIPANTS[conversationId];
  if (!participants || !participants.includes(verifiedChar)) {
    throw new Error(\`Akses ditolak: Anda bukan partisipan dalam percakapan \${conversationId}.\`);
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  const messages = [];
  snapshot.forEach((d) => {
    messages.push(d.data());
  });

  return messages;
}

/**
 * Realtime subscription to messages for a conversation.
 */
export function dbSubscribeMessages(conversationId, authUser, onUpdate, onError) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const participants = CONVERSATION_PARTICIPANTS[conversationId];
  if (!participants || !participants.includes(verifiedChar)) {
    throw new Error(\`Akses ditolak: Anda bukan partisipan dalam percakapan \${conversationId}.\`);
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = [];
      snapshot.forEach((d) => {
        messages.push(d.data());
      });
      if (typeof onUpdate === 'function') onUpdate(messages);
    },
    (err) => {
      console.warn(\`Realtime messages error on \${conversationId}:\`, err);
      if (typeof onError === 'function') onError(err);
    }
  );
}

/**
 * Fetches all conversations where the user is a participant.
 */
export async function dbFetchConversations(authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participants', 'array-contains', verifiedChar)
  );

  const snapshot = await getDocs(q);
  const convs = [];
  snapshot.forEach((d) => {
    convs.push(d.data());
  });
  return convs;
}

/**
 * Marks a message as read by the active user.
 */
export async function dbMarkMessageRead(messageId, authUser) {
  if (!authUser || !authUser.uid || !db) return;

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) return;

  try {
    const msgRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(msgRef, {
      [\`readBy.\${verifiedChar}\`]: true
    });
  } catch (err) {
    // Non-fatal if update fails
  }
}
`;

if (!code.includes('MESSAGES_COLLECTION')) {
  code += messagesModuleCode;
  fs.writeFileSync('firebase.js', code, 'utf8');
  console.log('Successfully appended Messages module to firebase.js');
} else {
  console.log('Messages module already present in firebase.js');
}

