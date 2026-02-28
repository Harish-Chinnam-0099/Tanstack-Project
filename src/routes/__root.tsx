// import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'

// import appCss from '../styles.css?url'

// const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

// export const Route = createRootRoute({
//   head: () => ({
//     meta: [
//       {
//         charSet: 'utf-8',
//       },
//       {
//         name: 'viewport',
//         content: 'width=device-width, initial-scale=1',
//       },
//       {
//         title: 'TanStack Start Starter',
//       },
//     ],
//     links: [
//       {
//         rel: 'stylesheet',
//         href: appCss,
//       },
//     ],
//   }),
//   shellComponent: RootDocument,
// })

// function RootDocument({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
//         <HeadContent />
//       </head>
//       <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
//         {children}
//         <TanStackDevtools
//           config={{
//             position: 'bottom-right',
//           }}
//           plugins={[
//             {
//               name: 'Tanstack Router',
//               render: <TanStackRouterDevtoolsPanel />,
//             },
//           ]}
//         />
//         <Scripts />
//       </body>
//     </html>
//   )
// }



// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'

const queryClient=new QueryClient()

function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent:NotFound,
})

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
       <Outlet/>
        <ReactQueryDevtools initialIsOpen={false}/>
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}