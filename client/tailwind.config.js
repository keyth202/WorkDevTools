/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
    './index.html',
	'./pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/shadcn/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
  	container: {
  		center: 'true',
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
			primary: '#000000',
			secondary: '#F5F5DC',
			accent: '#FF6B6B',
			highlight: '#4ECDC4',
			action: '#FFBE0B',
  			
  		},
		boxShadow: {
			'event': '0 8px 20px rgba(0,0,0,0.15)',
			'cause': '0 10px 25px rgba(255, 107, 107, 0.3)'
		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
			"slide-up": {
				"0%": { transform: "translateY(100%)", opacity: 0 },
				"100%": { transform: "translateY(0)", opacity: 1 },
			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
			"slide-up": "slide-up 0.5s ease-out",
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  //purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
}

