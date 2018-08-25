## express

see https://expressjs.com/en/starter/hello-world.html

## Code style: airbnb

We follow [Airbnb's Javascript
styleguide](https://github.com/airbnb/javascript).

## Object capability (ocap) discipline

In order to supporting robust composition and cooperation without
vulnerability, javascript code in this project should adhere to
[object capability discipline][ocap]. (_This discipline is built-in to
Rholang._)

  - **Memory safety and encapsulation**
    - There is no way to get a reference to an object except by
      creating one or being given one at creation or via a message; no
      casting integers to pointers, for example. _JavaScript is safe
      in this way._

      From outside an object, there is no way to access the internal
      state of the object without the object's consent (where consent
      is expressed by responding to messages). _We use `Object.freeze`
      and closures rather than properties on `this` to achieve this._

  - **Primitive effects only via references**
    - The only way an object can affect the world outside itself is
      via references to other objects. All primitives for interacting
      with the external world are embodied by primitive objects and
      **anything globally accessible is immutable data**. Don't import
      powerful objects at module scope. _It takes some discipline to
      use modules in node.js in this way.  We use a convention of only
      accessing ambient authority inside `if (require.main == module)
      { ... }`._

ISSUE: gloss powerful reference, ambient authority

[ocap]: http://erights.org/elib/capability/ode/ode-capabilities.html
