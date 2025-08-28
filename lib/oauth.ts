import OAuth from "oauth-1.0a";
import crypto from "crypto";
import axios from "axios";

export interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url: string
}


export interface TwitterAuthResponse {
  access_token: string
  user: TwitterUser
}

function hash_function_sha1(base_string: any, key: any) {
	return crypto.createHmac("sha1", key).update(base_string).digest("base64");
}

export const oauth =  new OAuth({
	consumer: {
		key: process.env.TWITTER_API_KEY as string,
        secret: process.env.TWITTER_CLIENT_SECRET as string,
	},
	signature_method: "HMAC-SHA1",
    hash_function: hash_function_sha1,
});

// import addOAuthInterceptor from 'axios-oauth-1.0a';

// Create a client whose requests will be signed
// export const oauthClient = axios.create();

// Specify the OAuth options
// const options = {
//     algorithm: 'HMAC-SHA1'as const,
//     key: process.env.TWITTER_API_KEY as string,
//     secret: process.env.TWITTER_CLIENT_SECRET as string,
// };

// // Add interceptor that signs requests
// addOAuthInterceptor(oauthClient, options);