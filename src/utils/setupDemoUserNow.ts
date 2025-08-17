import { supabase } from '@/integrations/supabase/client';

/**
 * Immediate demo user setup - Run this to create the demo user right now
 */
export const setupDemoUserNow = async () => {
  const DEMO_EMAIL = 'demo@krishisakha.com';
  const DEMO_PASSWORD = 'demo123456';
  const DEMO_NAME = 'Demo Farmer';

  try {
    console.log('🚀 Starting immediate demo user setup...');

    // Step 1: Try to sign up the demo user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: {
        data: {
          full_name: DEMO_NAME
        }
      }
    });

    if (signUpError) {
      // Check if user already exists
      if (signUpError.message?.includes('already registered')) {
        console.log('✅ Demo user already exists');
        
        // Test sign in to verify it works
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });

        if (signInError) {
          console.error('❌ Demo user exists but cannot sign in:', signInError);
          return { success: false, error: signInError, message: 'Demo user exists but login failed' };
        } else {
          console.log('✅ Demo user verified - can sign in successfully');
          await supabase.auth.signOut(); // Clean up
          return { success: true, message: 'Demo user already exists and works' };
        }
      } else {
        console.error('❌ Failed to create demo user:', signUpError);
        return { success: false, error: signUpError };
      }
    }

    // Step 2: If signup was successful, verify login works
    if (signUpData.user) {
      console.log('📝 Demo user created, verifying login...');
      
      // Sign out first
      await supabase.auth.signOut();
      
      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (signInError) {
        console.warn('⚠️ Demo user created but login verification failed. This might be due to email confirmation requirements.');
        return { 
          success: true, 
          message: 'Demo user created but may need email confirmation',
          needsConfirmation: true 
        };
      } else {
        console.log('✅ Demo user created and verified successfully');
        await supabase.auth.signOut(); // Clean up
        return { success: true, message: 'Demo user created and fully functional' };
      }
    }

    return { success: false, error: 'Unknown error during setup' };

  } catch (error) {
    console.error('❌ Setup error:', error);
    return { success: false, error };
  }
};

// Run immediately when this file is imported
setupDemoUserNow().then(result => {
  if (result.success) {
    console.log('🎉 Demo user setup completed:', result.message);
  } else {
    console.error('💥 Demo user setup failed:', result.error);
  }
});
