/**
 * Button.jsx — Reusable Button Component
 * ─────────────────────────────────────────────────────────────────────────────
 * A fully-styled, accessible button matching the platform's neo-brutalist theme.
 *
 * Props:
 *   children   — button label / content
 *   variant    — 'primary' | 'secondary' | 'yellow' | 'ghost' | 'danger'
 *   size       — 'sm' | 'md' | 'lg'
 *   fullWidth  — boolean; stretches to 100% width
 *   loading    — boolean; shows a spinner and disables the button
 *   disabled   — boolean
 *   onClick    — click handler
 *   type       — 'button' | 'submit' | 'reset'
 *   className  — extra class names
 *   ...rest    — any other <button> props (e.g. aria-*, id)
 *
 * Usage:
 *   <Button variant="primary" size="md" onClick={handleClick}>Log In →</Button>
 *   <Button variant="ghost" loading>Saving…</Button>
 */

import React from 'react'
import './Button.css'

const Button = ({
  children,
  variant   = 'primary',
  size      = 'md',
  fullWidth = false,
  loading   = false,
  disabled  = false,
  onClick,
  type      = 'button',
  className = '',
  ...rest
}) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}

export default Button
