wip:wd dashboard
================


Contributing to the project has a few hard requirements, hereby defined. Other
requirements may not be defined here, or may come up casualistically during
development, and should be added as developers and maintainers become aware of
them.


1. All commits must be contain a [Developer Certificate of
   Origin](https://developercertificate.org/); i.e., they
   must be signed-off-by.

   This can be achieved, with the git CLI command at
   time of commit, using the `-s` option; e.g., `git commit -s -m 'foo'`.

2. All commits must be signed.

   Commit signing should be supported by most git clients, and signed commits
   will be recognized automatically by github should the developer have taken
   appropriate steps towards that. You can find more information on how to
   sign your commits in the [Github
   Documentation](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/managing-commit-signature-verification).

3. Commit messages must be succint, and have a header describing which parts
   are being touched. E.g.,

   Use
      > frontend: add new feature FOO
      >
      >   Adds new feature FOO, which will make everything so much better
      >   because it will do BAR as BAZ.
      >
      >   Signed-off-by: Joao Eduardo Luis \<joao@wipwd.dev\>
      >

   And not
      > add feature FOO to frontend to do BAR and BAZ
      >
      >   Signed-off-by: Joao Eduardo Luis \<joao@wipwd.dev\>

   The former is okay, the latter is not.

4. A patch set must be composed of logically independent commits.

   When working on a patchset instead of an individual commit, all the patch
   set must strive to be an aggregate of individual commits as much as
   possible, except in very specific occasions and for very good reasons.

   In a patchset, all commits should be able to be individually compiled, and
   individually tested, without being noticeably broken.

   This does not mean bundling all the changes into one big commit, because
   that makes it hard to review, and does not mean separating commits on a
   line-by-line basis either, because that's just silly. Common sense should
   be applied, and reviewers should ensure the developers struggling with this
   are helped constructively.

5. New dependencies need to be described and justified.

   Anything that grows our dependence on external libraries must be based on
   sound technical reasons, and thus properly argued for upon adding. They
   should be added as part of either a proposed feature or seminal work, but
   they should never be added alone and by themselves as part of "future
   work".

6. History should be preserved.

   This means that we should not be changing code for the sake of changing
   code. Clean ups are very welcome, but not when they are essentially
   changing spacing on a bazillion files because someone is getting an itch.

   Cleanup should be performed as part of on-going work. At times we may
   choose to perform deeper cleanings, but that should still be done in a
   reasonable fashion, and properly validated by others.

7. Contributing with code must follow the current linting specification.

   At times, the linting specification might be changed, which can, and likely
   will, affect the existing code base. We don't believe the entire code base
   should be modified because a rule was changed. Existing code will be kept
   as it was, even if that breaks the linter. Code shall only be cleaned up
   according to 6., unless a strong enough reason, properly justified, exists.

8. Fixes need to be tagged in the commit, and contain the URL to the issue.

   When fixing an issue, the commit must contain a `Fixes:` tag followed by
   the full URL to the ticket. E.g.,

   > backend: fix bug on feature FOO causing behavior BAR
   >
   > Fixes: https://github.com/wipwd/wwd-dashboard/issues/1337
   >
   > Signed-off-by: Joao Eduardo Luis \<joao@wipwd.dev\>
   >

9. Never commit to master directly!

   All code changes should come from pull requests via the developer's own
   fork.

10. All pull requests need at least one review.

   To ensure code sanity, all pull requests should have at least one review
   before being merged. Exceptions may apply.

11. All conversation and participation must remain civil and constructive.

   There is an expectation, and room for, conflict, disagreement, and
   negativity towards proposed contributions; as long as those are based on
   technical, sound reasons, and are presented in a constructive, good-faith
   manner. Negativity for negativity's sake is not condoned, and not
   acceptable. While we strive for transparency and openness, negative
   feedback that can be provided directly on a 1:1 basis should be done in
   such a fashion, instead of out in the open.

