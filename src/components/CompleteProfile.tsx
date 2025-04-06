// CompleteProfile.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    company: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get the Auth0 state from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const state = urlParams.get('state');
      const domain = import.meta.env.VITE_AUTH0_DOMAIN;
      // Send the profile data back to Auth0

      if (!state) {
        console.error('Missing state parameter from Auth0');
        return;
      }

      await fetch(`https://${domain}/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          state,
          additionalProfileData: formData
        })
      });

      window.location.href = '/dashboard';

      // Auth0 will redirect to your application after this
    } catch (error) {
      console.error('Error submitting profile:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Propify
          </h1>
          <h2 className="mt-6 text-2xl font-semibold">Complete Your Profile</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input 
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role"
                name="role"
                type="text"
                value={formData.role}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;