import { GoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '../hooks/useGoogleauth';

interface GoogleButtonProps {
  label?: string;
}

/**
 * GoogleButton — uses GoogleLogin component from @react-oauth/google
 *
 * Flow:
 * 1. User clicks → Google One Tap / popup opens
 * 2. User selects account → Google returns CredentialResponse
 * 3. credential = ID token (JWT) — exactly what our backend needs
 * 4. We send idToken to POST /auth/google
 * 5. Backend verifies with OAuth2Client.verifyIdToken() ✅
 *
 * Why GoogleLogin and not useGoogleLogin?
 * useGoogleLogin returns an access_token, NOT an id_token.
 * Our backend uses OAuth2Client.verifyIdToken() which requires id_token.
 * GoogleLogin component returns credential = id_token directly. ✅
 */
export const GoogleButton = ({ label = 'Continue with Google' }: GoogleButtonProps) => {
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();

  return (
    // Outer div fills container — inner GoogleLogin uses fixed pixel width
    <div className="w-full flex justify-center overflow-hidden">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            handleGoogleSuccess(credentialResponse.credential);
          } else {
            handleGoogleError();
          }
        }}
        onError={handleGoogleError}
        useOneTap={false}
        theme="filled_black"
        size="large"
        width="400"   // ← pixels only, not percentage
        text={label === 'signin_with' ? 'signin_with' : 'signup_with'}
        shape="rectangular"
      />
    </div>
  );
};