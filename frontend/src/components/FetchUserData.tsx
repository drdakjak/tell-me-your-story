import { get } from '@aws-amplify/api';



const fetchUser = async () => {
    try {
        const { body } = await get({
            apiName: 'Api',
            path: 'fetch_user',
        }).response;
        const userData = await body.json();
        console.log(userData)
        return userData;
    } catch (error) {
        console.error('Error fetching user:', error);
    } finally {
        console.log('User fetched');
    }
};

export default fetchUser;