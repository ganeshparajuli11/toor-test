import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useOAuth from '../hooks/useOAuth';
import toast from 'react-hot-toast';
import './OAuthCallback.css';

/**
 * OAuth Callback Handler
 * Handles the callback from Google/Facebook OAuth
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const { socialLogin } = useAuth();
  const { handleOAuthCallback } = useOAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError(searchParams.get('error_description') || 'Authentication was cancelled');
        toast.error('Authentication cancelled');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        toast.error('Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        setStatus('authenticating');
        const result = await handleOAuthCallback(code, provider);

        if (result.success && result.user) {
          // Use socialLogin from AuthContext to log in the user
          await socialLogin(result.user);
          setStatus('success');
          toast.success(`Welcome, ${result.user.name}!`);
          setTimeout(() => navigate('/'), 1500);
        } else {
          setStatus('error');
          setError(result.message || 'Authentication failed');
          toast.error(result.message || 'Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError('An error occurred during authentication');
        toast.error('Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [code, provider, handleOAuthCallback, socialLogin, navigate, searchParams]);

  return (
    <div className="oauth-callback">
      <div className="oauth-callback-card">
        {status === 'processing' && (
          <>
            <div className="oauth-spinner"></div>
            <h2>Processing...</h2>
            <p>Connecting to {provider === 'google' ? 'Google' : 'Facebook'}...</p>
          </>
        )}

        {status === 'authenticating' && (
          <>
            <div className="oauth-spinner"></div>
            <h2>Authenticating...</h2>
            <p>Verifying your credentials...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="oauth-success-icon">✓</div>
            <h2>Success!</h2>
            <p>Redirecting you to the homepage...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="oauth-error-icon">✕</div>
            <h2>Authentication Failed</h2>
            <p>{error}</p>
            <p className="oauth-redirect-text">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
