import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					light: 'hsl(var(--accent-light))',
					dark: 'hsl(var(--accent-dark))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Modern status colors
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Legacy construction colors (maintaining compatibility)
				navy: {
					DEFAULT: '#0a192f',
					light: '#172a45',
					dark: '#020c1b'
				},
				slate: {
					DEFAULT: '#8892b0',
					light: '#a8b2d1',
					dark: '#495670'
				},
				status: {
					approved: 'hsl(var(--status-approved))',
					conditional: 'hsl(var(--status-conditional))',
					rejected: 'hsl(var(--status-rejected))',
					pending: '#6b7280'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'var(--radius-xl)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-md)',
				'premium': 'var(--shadow-lg)',
				'luxury': 'var(--shadow-2xl)',
				'subtle': 'var(--shadow-sm)',
				'soft': 'var(--shadow)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-backdrop': 'var(--gradient-backdrop)'
			},
			fontFamily: {
				'display': ['Playfair Display', 'serif'],
				'body': ['Inter', 'sans-serif'],
				'arabic': ['Cairo', 'Inter', 'sans-serif'],
				'arabic-display': ['Amiri', 'Cairo', 'serif']
			},
			transitionDuration: {
				'fast': '150ms',
				'base': '250ms', 
				'slow': '350ms'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem'
			},
            keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'scale-out': {
					from: { 
						transform: 'scale(1)', 
						opacity: '1' 
					},
					to: { 
						transform: 'scale(0.95)', 
						opacity: '0' 
					}
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' 
					},
					'50%': { 
						boxShadow: '0 0 40px hsl(var(--primary) / 0.6)' 
					}
				},
				// Modal and Menu specific animations
				'modal-fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'modal-fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'modal-scale-in': {
					'0%': { transform: 'scale(0.95)' },
					'100%': { transform: 'scale(1)' }
				},
				'modal-scale-out': {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(0.95)' }
				},
				'menu-slide-in': {
					'0%': { 
						opacity: '0',
						transform: 'translateY(-10px) scale(0.95)' 
					},
					'100%': { 
						opacity: '1',
						transform: 'translateY(0) scale(1)' 
					}
				},
				'menu-slide-out': {
					'0%': { 
						opacity: '1',
						transform: 'translateY(0) scale(1)' 
					},
					'100%': { 
						opacity: '0',
						transform: 'translateY(-10px) scale(0.95)' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 200ms cubic-bezier(0.4, 0, 0.2, 1)',
				'accordion-up': 'accordion-up 200ms cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in': 'fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-out': 'fade-out 150ms cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scale-in 150ms cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-out': 'scale-out 100ms cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-right': 'slide-in-right 200ms cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-out-right': 'slide-out-right 150ms cubic-bezier(0.4, 0, 0.2, 1)',
				'shimmer': 'shimmer 2s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				// Optimized durations for snappiness
				'modal-enter': 'modal-fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1), modal-scale-in 150ms cubic-bezier(0.4, 0, 0.2, 1)',
				'modal-exit': 'modal-fade-out 150ms cubic-bezier(0.4, 0, 0.2, 1), modal-scale-out 100ms cubic-bezier(0.4, 0, 0.2, 1)',
				'menu-enter': 'menu-slide-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
				'menu-exit': 'menu-slide-out 150ms cubic-bezier(0.4, 0, 0.2, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;