import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ApplicationPage } from '../../features/auth/pages/ApplicationPage'
import { SignInPage } from '../../features/auth/pages/SignInPage'
import { SignUpPage } from '../../features/auth/pages/SignUpPage'
import { AuthGuard } from '../../features/auth/components/AuthGuard'
import { LandingPage } from '../../features/marketing/pages/LandingPage'

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<SignUpPage />} path="/signup" />
        <Route element={<SignInPage />} path="/login" />
        <Route element={<SignInPage />} path="/signin" />
        <Route
          element={
            <AuthGuard>
              <ApplicationPage />
            </AuthGuard>
          }
          path="/application"
        />
        <Route
          element={
            <AuthGuard>
              <ApplicationPage />
            </AuthGuard>
          }
          path="/app"
        />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}
