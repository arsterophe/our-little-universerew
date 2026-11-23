import fs from 'fs';

let content = fs.readFileSync('firestore.rules', 'utf8');

const validationBlock = `
    // --- Messages & Conversations Validation ---
    function isMessageParticipant(data) {
      return ('participants' in data) &&
             data.participants is list &&
             (
               (request.auth.token.email == 'nyanya@ourlittleuniverse.com' && 'nyanya' in data.participants) ||
               (request.auth.token.email == 'lala@ourlittleuniverse.com' && 'lala' in data.participants) ||
               (request.auth.token.email == 'lele@ourlittleuniverse.com' && 'lele' in data.participants)
             );
    }

    function isValidMessage(data) {
      return data.keys().hasOnly([
               'id', 'conversationId', 'senderUid', 'senderCharacter',
               'senderName', 'senderAvatar', 'participants', 'text',
               'createdAt', 'updatedAt', 'readBy', 'clientTimestamp'
             ]) &&
             hasRequiredFields(['id', 'conversationId', 'senderUid', 'senderCharacter', 'participants', 'text', 'createdAt']) &&
             data.id is string && data.id.size() > 0 && data.id.size() <= 100 &&
             data.conversationId is string && data.conversationId.size() > 0 && data.conversationId.size() <= 100 &&
             data.conversationId in ['lala_lele', 'lala_nyanya', 'lele_nyanya', 'all_friends'] &&
             data.senderUid == request.auth.uid &&
             data.senderCharacter in ['nyanya', 'lala', 'lele'] &&
             isCharacterUser(data.senderCharacter) &&
             data.participants is list && data.participants.size() >= 2 && data.participants.size() <= 3 &&
             data.senderCharacter in data.participants &&
             data.text is string && data.text.size() > 0 && data.text.size() <= 2000 &&
             (data.createdAt is number || data.createdAt is string) &&
             (!('updatedAt' in data) || (data.updatedAt is number || data.updatedAt is string)) &&
             (!('senderName' in data) || (data.senderName is string && data.senderName.size() <= 100)) &&
             (!('senderAvatar' in data) || (data.senderAvatar is string && data.senderAvatar.size() <= 500)) &&
             (!('readBy' in data) || (data.readBy is map && data.readBy.keys().hasOnly(['nyanya', 'lala', 'lele'])));
    }

    function isValidConversationDoc(data) {
      return data.keys().hasOnly([
               'id', 'participants', 'lastMessage', 'lastSender',
               'lastSenderUid', 'lastMessageAt', 'updatedAt'
             ]) &&
             hasRequiredFields(['id', 'participants']) &&
             data.id is string && data.id in ['lala_lele', 'lala_nyanya', 'lele_nyanya', 'all_friends'] &&
             data.participants is list && data.participants.size() >= 2 && data.participants.size() <= 3 &&
             (!('lastMessage' in data) || (data.lastMessage is string && data.lastMessage.size() <= 2000)) &&
             (!('lastSender' in data) || (data.lastSender in ['nyanya', 'lala', 'lele'])) &&
             (!('lastSenderUid' in data) || (data.lastSenderUid is string && data.lastSenderUid == request.auth.uid)) &&
             (!('lastMessageAt' in data) || (data.lastMessageAt is number || data.lastMessageAt is string)) &&
             (!('updatedAt' in data) || (data.updatedAt is number || data.updatedAt is string));
    }
`;

content = content.replace(
  '    // ===============================================================\n    // Collection Rules',
  validationBlock + '\n    // ===============================================================\n    // Collection Rules'
);

const collectionRulesBlock = `
    // 6. Messages (messages)
    match /messages/{messageId} {
      allow read: if isAuthenticated() &&
                     isUniverseMember() &&
                     (
                       resource == null ||
                       isMessageParticipant(resource.data)
                     );

      allow create: if isAuthenticated() &&
                       isUniverseMember() &&
                       request.resource.data.id == messageId &&
                       request.resource.data.senderUid == request.auth.uid &&
                       isCharacterUser(request.resource.data.senderCharacter) &&
                       isValidMessage(request.resource.data);

      allow update: if isAuthenticated() &&
                       isUniverseMember() &&
                       (
                         // Sender editing own message text
                         (
                           resource.data.senderUid == request.auth.uid &&
                           request.resource.data.id == resource.data.id &&
                           request.resource.data.senderUid == resource.data.senderUid &&
                           request.resource.data.senderCharacter == resource.data.senderCharacter &&
                           request.resource.data.conversationId == resource.data.conversationId &&
                           request.resource.data.createdAt == resource.data.createdAt &&
                           isValidMessage(request.resource.data)
                         )
                         ||
                         // Recipient updating read receipt
                         (
                           isMessageParticipant(resource.data) &&
                           request.resource.data.id == resource.data.id &&
                           request.resource.data.senderUid == resource.data.senderUid &&
                           request.resource.data.senderCharacter == resource.data.senderCharacter &&
                           request.resource.data.conversationId == resource.data.conversationId &&
                           request.resource.data.text == resource.data.text &&
                           request.resource.data.createdAt == resource.data.createdAt &&
                           isValidMessage(request.resource.data)
                         )
                       );

      allow delete: if isAuthenticated() && isUniverseMember() && resource.data.senderUid == request.auth.uid;
    }

    // 7. Conversations (conversations)
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() &&
                     isUniverseMember() &&
                     (
                       resource == null ||
                       isMessageParticipant(resource.data)
                     );

      allow create, update: if isAuthenticated() &&
                               isUniverseMember() &&
                               isMessageParticipant(request.resource.data) &&
                               isValidConversationDoc(request.resource.data);

      allow delete: if false;
    }
`;

content = content.replace(
  '    // ===============================================================\n    // Default Deny Rule for All Other Paths',
  collectionRulesBlock + '\n    // ===============================================================\n    // Default Deny Rule for All Other Paths'
);

fs.writeFileSync('firestore.rules', content, 'utf8');
console.log('Successfully updated firestore.rules with Messages and Conversations rules');

