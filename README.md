# eNAF - Project Plan

## PURPOSE:
Enable the user to get information about a person (company, siret of it, naf of it, etc.) from an email address.

## INPUT(S):
- 1 email
- 2+ emails
- Format: txt, pdf (maybe)
    -> identify emails with ai/regex

## PROCESS:
- API -> API Sirene (Insee)
    -> requirements
        - OAuth2 token: account, register an app, client ID, client secret
- Fuzzy Macthing (v2)

## OUTPUT(S):
- csv file

- e.g.:

email | name | company | siret | naf
------------------------------------
sirius@e-naf.com | Sirius | eNAF | 123456789 | 1234