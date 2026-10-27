# Bruno collections

API collection for this repository, migrated from an old Insomnia export. That export is no longer
in the working tree; **this folder is the maintained copy from now on**.

## Collections

| Folder | Collection | Contents |
| --- | --- | --- |
| `Sweet Home/` | `Sweet Home` | 23 requests, 6 folders, 2 environments |

## Running

Open the collection with **Bruno → Collection → Open**, or from the CLI (quote the environment
name, it contains spaces):

```sh
pnpm dlx @usebruno/cli run "Sweet Home" --env "sweet home"
```

## Environments

`Sweet Home/`:

| Environment | Base URL (`{{ep}}`) | Notes |
| --- | --- | --- |
| `Base Environment` | — | empty in Insomnia, kept for parity |
| `sweet home` | `http://localhost:3005/api` | this API (`.env`: `PORT=3005`, `PREFIX=api`) |

### Secrets are not in this repository

`token` and `email` (`sweet home`) are declared as **secret variables**, so only their names are
stored here:

```
vars:secret [
  token
  email
]
```
