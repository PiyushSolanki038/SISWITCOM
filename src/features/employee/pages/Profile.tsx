import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">My Profile</h2>
        <p className="text-slate-500">Manage your personal information and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Click to upload a new photo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-4xl bg-[#1A3C34] text-white">
                {user?.name?.charAt(0) || 'E'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="w-full">Change Photo</Button>
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details and role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" defaultValue={user?.name?.split(' ')[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" defaultValue={user?.name?.split(' ')[1]} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={user?.role || ''} disabled className="capitalize" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" placeholder="Tell us about yourself" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-[#1A3C34] hover:bg-[#122a25]">Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeProfile;
