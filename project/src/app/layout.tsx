import React from 'react';
import '@/index.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Lecture Notebook</title>
      </head>
      <body className="font-sans antialiased">
        <React.Fragment>
        {children}
        </React.Fragment>
      </body>
    </html>
  );
}