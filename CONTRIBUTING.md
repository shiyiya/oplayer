# Contributing 💜

Glad to see you here! This project is open to anyone who wishes to contribute in any way: code, doc, test, ...

## Prerequisites

This project uses [pnpm](https://pnpm.io/) as package manager, please [install](https://pnpm.io/installation) it before continuing.

```bash
npm i -g pnpm
```

## Clone & Install

```bash
git clonegit@github.com:shiyiya/oplayer.git --depth=1
cd oplayer
pnpm i
```

## Development workflow

1. Create a new branch for your amazing feature.

   ```bash
   git checkout -b feat-add-something-amazing
   ```

2. Start dev mode.

   ```bash
   pnpm run build
   pnpm --filter=@oplayer/<package_name> run start
   pnpm run dev:exam
   ```

   - standalone: http://localhost:5173/

3. Make your changes...

4. Write some test(s).

5. Check that everything is ok.

6. Commit your changes

   ```bash
   git add .
   git commit -m "feat: my amazing feature"
   ```

7. Create a Pull Request

   If all is ok you can [create a PR](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request), you don't need to finish your feature before publishing it, you can make a draft so that we can discuss it together.

Thanks
