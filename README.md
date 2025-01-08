# Larasvelte Starter Kit by Ose Ughu

This repository is a Laravel + Inertia + Svelte 5 + Progressive Web App (PWA) Starter Kit designed to help you kickstart your web application development. It integrates modern tools like SQLite, Bun, TailwindCSS, and ShadCN UI to provide a fully functional foundation for building reactive and scalable web applications.

Key Features
• Laravel + Inertia: A robust backend combined with a reactive front end.
• Svelte 5: Utilises the latest version of Svelte for seamless front-end interactivity.
• Progressive Web App (PWA): Configured to work offline and feel like a native app.
• Bun: Ultra-fast JavaScript runtime for bundling and running your front-end assets.
• TailwindCSS: Rapid UI development with utility-first CSS.
• ShadCN UI: Modern and accessible UI components out of the box.
• Subdomain Routing: Includes an example configuration in RouteServiceProvider with additional routes in routes/admin.php.

Installation

Follow these steps to get started quickly:

Clone the Repository:

```bash
git clone <https://github.com/oseughu/larasvelte.git>
cd larasvelte
```

Install PHP Dependencies:

```bash
composer install
```

Install JavaScript Dependencies:

```bash
bun install
```

Run following command to start up everything (Backend Server, Frontend Server, Queue and Mailer):

```bash
composer run dev
```

Subdomain Routing Example

The codebase includes an example of subdomain routing configured in the RouteServiceProvider. The subdomain routing example is specifically for an admin panel and uses routes/admin.php.

If subdomain routing is not required for your project, you can remove it by either:

1. Commenting out or deleting the configuration in the RouteServiceProvider. \
2. Removing the routes/admin.php file.

Start Building

This starter kit is highly customisable! Clone the repository and delete any files or features you don’t need. It’s flexible enough to support a wide range of use cases, from small side projects to large-scale applications.

Contributions

We welcome contributions! Whether it’s bug fixes, feature additions, or general improvements, feel free to submit a pull request.

We regularly update packages and dependencies to ensure the codebase stays modern and secure.

Requirements
• PHP 8.3 or later
• Composer
• Bun (recommended) or Node.js
• SQLite (default) or your preferred database engine

Happy coding! 🚀
