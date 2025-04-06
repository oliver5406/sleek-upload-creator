import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const UserProfile = () => {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    company: '',
    role: ''
  });

  // Load user metadata if available
  useEffect(() => {
    if (user?.metadata?.profile) {
      const { fullName, phoneNumber, company, role } = user.metadata.profile;
      setFormData({
        fullName: fullName || '',
        phoneNumber: phoneNumber || '',
        company: company || '',
        role: role || ''
      });
    } else if (user?.name) {
      setFormData(prev => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get fresh token
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      // Update user metadata via your backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile: formData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Your phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Your role"
                  />
                </div>
              </div>
              
              <CardFooter className="flex justify-between mt-6 px-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;