'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface NetworkUser {
  id: string
  email: string
  role: string
  first_name?: string
  last_name?: string
  company?: string
  location?: string
  isConnected: boolean
  connectionStatus?: 'pending' | 'accepted' | 'none'
}

export default function NetworkPage() {
  const [users, setUsers] = useState<NetworkUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<NetworkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) return

        // Mock data for now - in real implementation, this would come from API
        const mockUsers: NetworkUser[] = [
          {
            id: 'user1',
            email: 'sponsor@example.com',
            role: 'deal_sponsor',
            first_name: 'John',
            last_name: 'Doe',
            company: 'Real Estate Ventures LLC',
            location: 'New York, NY',
            isConnected: false,
            connectionStatus: 'none' as const
          },
          {
            id: 'user2',
            email: 'investor@example.com',
            role: 'capital_partner',
            first_name: 'Jane',
            last_name: 'Smith',
            company: 'Smith Capital',
            location: 'Los Angeles, CA',
            isConnected: true,
            connectionStatus: 'accepted' as const
          },
          {
            id: 'user3',
            email: 'service@example.com',
            role: 'service_provider',
            first_name: 'Mike',
            last_name: 'Johnson',
            company: 'Property Management Pro',
            location: 'Chicago, IL',
            isConnected: false,
            connectionStatus: 'pending' as const
          }
        ].filter(u => u.id !== currentUser.id)

        setUsers(mockUsers)
        setFilteredUsers(mockUsers)
      } catch (error) {
        toast.error('Failed to load network')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [supabase.auth])

  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, roleFilter, users])

  const handleConnect = async (userId: string) => {
    try {
      // Mock API call - in real implementation, this would send connection request
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, connectionStatus: 'pending' as const }
          : user
      ))
      toast.success('Connection request sent!')
    } catch (error) {
      toast.error('Failed to send connection request')
    }
  }

  const handleAcceptConnection = async (userId: string) => {
    try {
      // Mock API call - in real implementation, this would accept connection
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isConnected: true, connectionStatus: 'accepted' as const }
          : user
      ))
      toast.success('Connection accepted!')
    } catch (error) {
      toast.error('Failed to accept connection')
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'deal_sponsor':
        return 'Deal Sponsor'
      case 'capital_partner':
        return 'Capital Partner'
      case 'service_provider':
        return 'Service Provider'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'deal_sponsor':
        return 'default'
      case 'capital_partner':
        return 'secondary'
      case 'service_provider':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return <div>Loading network...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Professional Network</h1>
        <p className="text-gray-600">
          Connect with deal sponsors, capital partners, and service providers
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search professionals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="deal_sponsor">Deal Sponsors</SelectItem>
            <SelectItem value="capital_partner">Capital Partners</SelectItem>
            <SelectItem value="service_provider">Service Providers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold">No professionals found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </CardHeader>
              <CardContent>
                {user.company && (
                  <p className="text-sm text-gray-700 mb-1">{user.company}</p>
                )}
                {user.location && (
                  <p className="text-sm text-gray-600 mb-3">{user.location}</p>
                )}
                
                <div className="flex space-x-2">
                  {user.isConnected ? (
                    <Badge variant="secondary" className="text-xs">
                      Connected
                    </Badge>
                  ) : user.connectionStatus === 'pending' ? (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleAcceptConnection(user.id)}>
                        Accept
                      </Button>
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => handleConnect(user.id)}>
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}