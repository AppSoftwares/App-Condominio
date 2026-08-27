import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const Welcome: React.FC = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/auth', { replace: true })
  }, [navigate])

  return null
}
