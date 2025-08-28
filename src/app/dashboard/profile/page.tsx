'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserIcon, BuildingIcon, PenIcon, CheckIcon, XIcon, AlertCircleIcon } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    bio: '',
    userRole: ''
  })

  const [originalData, setOriginalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    bio: '',
    userRole: ''
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth/login')
          return
        }
        
        setUser(user)
        const userData = {
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          company: user.user_metadata?.company || '',
          title: user.user_metadata?.title || '',
          bio: user.user_metadata?.bio || '',
          userRole: user.user_metadata?.role || ''
        }
        
        setFormData(userData)
        setOriginalData(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [supabase.auth, router])

  const handleEdit = () => {
    setEditing(true)
    setError(null)
    setSuccess(false)
  }

  const handleCancel = () => {
    setFormData(originalData)
    setEditing(false)
    setError(null)
    setSuccess(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          company: formData.company,
          title: formData.title,
          bio: formData.bio,
          role: formData.userRole
        }
      })

      if (error) {
        throw error
      }

      // Update local state
      setOriginalData(formData)
      setEditing(false)
      setSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'deal_sponsor': return 'default'
      case 'capital_partner': return 'secondary'
      case 'service_provider': return 'outline'
      default: return 'secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'deal_sponsor': return 'Deal Sponsor'
      case 'capital_partner': return 'Capital Partner'
      case 'service_provider': return 'Service Provider'
      default: return 'Unknown Role'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
            {(formData.firstName?.[0] || formData.email?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {formData.firstName || formData.lastName 
                ? `${formData.firstName} ${formData.lastName}`.trim()
                : 'Your Profile'
              }
            </h1>
            <p className="text-muted-foreground">
              Manage your DealRoom Network profile information
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant={getRoleBadgeVariant(formData.userRole)} className="px-4 py-2">
            {getRoleLabel(formData.userRole)}
          </Badge>
          
          {!editing ? (
            <Button onClick={handleEdit}>
              <PenIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={saving}>
                <CheckIcon className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <XIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {editing ? (
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={saving}
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                    {formData.firstName || 'Not specified'}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {editing ? (
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={saving}
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                    {formData.lastName || 'Not specified'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
                {formData.email}
                <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {editing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  disabled={saving}
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                  {formData.phone || 'Not specified'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BuildingIcon className="h-5 w-5 mr-2" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Your business and professional details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userRole">Role</Label>
              {editing ? (
                <Select
                  value={formData.userRole}
                  onValueChange={(value) => setFormData({ ...formData, userRole: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deal_sponsor">Deal Sponsor</SelectItem>
                    <SelectItem value="capital_partner">Capital Partner</SelectItem>
                    <SelectItem value="service_provider">Service Provider</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                  {getRoleLabel(formData.userRole)}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              {editing ? (
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                  disabled={saving}
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                  {formData.company || 'Not specified'}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              {editing ? (
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Your job title"
                  disabled={saving}
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                  {formData.title || 'Not specified'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio Section */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Bio</CardTitle>
          <CardDescription>
            Tell other professionals about your experience and expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {editing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your professional background, expertise, and what you're looking for on DealRoom Network..."
                rows={4}
                disabled={saving}
              />
            ) : (
              <div className="px-3 py-3 bg-gray-50 rounded-md text-sm min-h-[100px]">
                {formData.bio || 'No bio provided yet. Click "Edit Profile" to add your professional background.'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This will be visible to other professionals on the network
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}