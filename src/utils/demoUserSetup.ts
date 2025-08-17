import { supabase } from '@/integrations/supabase/client';

export const DEMO_CREDENTIALS = {
  email: 'demo@krishisakha.com',
  password: 'demo123456',
  fullName: 'Demo Farmer'
};

/**
 * Creates demo user if it doesn't exist
 * This should be run manually or on first setup
 */
export const createDemoUserIfNotExists = async () => {
  try {
    console.log('🔄 Checking if demo user exists...');
    
    // Try to sign in first to see if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    });

    if (signInData.user && !signInError) {
      console.log('✅ Demo user already exists and can sign in');
      await supabase.auth.signOut(); // Sign out immediately
      return { success: true, message: 'Demo user already exists' };
    }

    // If sign in failed, try to create the user
    console.log('📝 Demo user not found, attempting to create...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      options: {
        data: {
          full_name: DEMO_CREDENTIALS.fullName
        },
        emailRedirectTo: undefined // Disable email confirmation for demo user
      }
    });

    if (signUpError) {
      console.error('❌ Failed to create demo user:', signUpError);
      return { success: false, error: signUpError };
    }

    console.log('✅ Demo user created successfully');
    await supabase.auth.signOut(); // Sign out immediately
    return { success: true, message: 'Demo user created successfully' };

  } catch (error) {
    console.error('❌ Error in demo user setup:', error);
    return { success: false, error };
  }
};

/**
 * Verifies demo user can sign in
 */
export const verifyDemoUserAccess = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    });

    if (error) {
      console.error('❌ Demo user cannot sign in:', error);
      return { canSignIn: false, error };
    }

    console.log('✅ Demo user can sign in successfully');
    await supabase.auth.signOut(); // Sign out immediately
    return { canSignIn: true, user: data.user };

  } catch (error) {
    console.error('❌ Error verifying demo user:', error);
    return { canSignIn: false, error };
  }
};

// Export utility functions for manual testing
export const demoUserUtils = {
  createDemoUserIfNotExists,
  verifyDemoUserAccess,
  credentials: DEMO_CREDENTIALS
};
