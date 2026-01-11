import { userDropdownItems } from '@/layouts/components/data'
import authService from '@/views/auth/services/auth.service'
import type { User } from '@/views/auth/services/auth.types'

import {Link, useNavigate} from "react-router";
import { Fragment, useEffect, useState } from 'react'
import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { TbChevronDown } from 'react-icons/tb'

import user3 from '@/assets/images/users/user-3.jpg'

const UserProfile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First, try to get user from localStorage (fast, no API call)
        const storedUser = localStorage.getItem('user_data')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as User
            setUser(parsedUser)
            setLoading(false)
          } catch (e) {
            // If parsing fails, fetch from API
          }
        }

        // Fetch fresh user data from API
        const response = await authService.getProfile(false)
        if (response.success && response.data?.user) {
          const userData = response.data.user
          setUser(userData)
          // Update localStorage with fresh data
          localStorage.setItem('user_data', JSON.stringify(userData))
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        // If API fails, try to use stored data as fallback
        const storedUser = localStorage.getItem('user_data')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as User
            setUser(parsedUser)
          } catch (e) {
            // If both fail, user will remain null
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/auth-1/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout API fails, clear local data and redirect
      localStorage.clear()
      navigate('/auth-1/sign-in')
    }
  }

  const displayName = user?.display_name || user?.email || 'User'
  const avatarUrl = user?.avatar_url || user3

  return (
    <div className="topbar-item nav-user">
      <Dropdown align="end">
        <DropdownToggle as={'a'} className="topbar-link dropdown-toggle drop-arrow-none px-2">
          <img 
            src={avatarUrl} 
            width="32" 
            height="32" 
            className="rounded-circle me-lg-2 d-flex" 
            alt="user-image" 
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              const target = e.target as HTMLImageElement
              target.src = user3
            }}
          />
          <div className="d-lg-flex align-items-center gap-1 d-none">
            <h5 className="my-0">{loading ? 'Loading...' : displayName}</h5>
            <TbChevronDown className="align-middle" />
          </div>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          {userDropdownItems.map((item, idx) => {
            // Handle logout separately
            if (item.label === 'Log Out') {
              return (
                <DropdownItem 
                  key={idx}
                  onClick={handleLogout}
                  className={item.class}
                >
                  {item.icon && <item.icon className="me-2 fs-17 align-middle" />}
                  <span className="align-middle">{item.label}</span>
                </DropdownItem>
              )
            }
            
            return (
              <Fragment key={idx}>
                {item.isHeader ? (
                  <div className="dropdown-header noti-title">
                    <h6 className="text-overflow m-0">{item.label}</h6>
                  </div>
                ) : item.isDivider ? (
                  <DropdownDivider />
                ) : (
                  <DropdownItem as={Link} to={item.url ?? ''} className={item.class}>
                    {item.icon && <item.icon className="me-2 fs-17 align-middle" />}
                    <span className="align-middle">{item.label}</span>
                  </DropdownItem>
                )}
              </Fragment>
            )
          })}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default UserProfile
