const VK = require('vksdk');

// No need to set this options, because we are using USER Token
const vk = new VK({
    'appId': 0,
    'appSecret': '',
    'language': ''
});

const deleteQueueSize = 30; // Max count of users to delete before delay (according to rules of vk.com ...)
const token = ''; // Token you get from IMPLICIT FLOW
const delay = 60000; // Again, according to rules of vk.com
const user_id = 0; // ID of user whose deleted/removed followers you want to remove
let usersInQueue = 0;

vk.setToken(token);
vk.setSecureRequests(true);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

if (token) {
    vk.request('users.getFollowers', {
        'user_id': user_id,
        'count': 1000,
        'fields': 'photo_50'
    }, (resp) => {
        for (let i = 0; i < resp.response.items.length; i++) {
            if (resp.response.items[i].deactivated === 'banned' || resp.response.items[i].deactivated === 'deleted') {
                if (usersInQueue < deleteQueueSize) {
                    usersInQueue++;
                    let log = `User ${resp.response.items[i].first_name} ${resp.response.items[i].last_name} has been banned successfully`;
                    vk.request('account.banUser', {
                        'user_id': resp.response.items[i].id
                    }, (resp) => {
                        if (resp.response === 1) {
                            console.log(log);
                        } else {
                            console.log(resp.response);
                        }
                    });
                } else {
                    usersInQueue = 0;
                    console.log(`Users queue reached maximum count(${deleteQueueSize}). Programm will continue send requests after delay (1 minute).`);
                    sleep(delay)
                }
            }
        }
    });
} else {
    console.log("No token.");
}
