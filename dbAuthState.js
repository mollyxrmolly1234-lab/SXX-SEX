const { saveAuthState, loadAuthState } = require('./database');
const { initAuthCreds } = require('@whiskeysockets/baileys');
const { proto } = require('@whiskeysockets/baileys');

async function useDatabaseAuthState(phoneNumber) {
  let creds, keys = {};
  
  const saved = await loadAuthState(phoneNumber);
  if (saved) {
    creds = saved.creds;
    keys = saved.keys;
  } else {
    creds = initAuthCreds();
  }

  const saveState = async () => {
    await saveAuthState(phoneNumber, creds, keys);
  };

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const data = {};
          for (const id of ids) {
            let value = keys[`${type}-${id}`];
            if (value) {
              if (type === 'app-state-sync-key') {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            }
          }
          return data;
        },
        set: (data) => {
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              if (value) keys[key] = value;
              else delete keys[key];
            }
          }
          saveState();
        }
      }
    },
    saveCreds: saveState
  };
}

module.exports = { useDatabaseAuthState };
