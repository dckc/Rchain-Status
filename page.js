export default function statusPage(ui, fetch) {
  ui.registerButton.addEventListener('click', () => {
    const userName = ui.nameBox.value;
    // TODO: What am I supposed to do with the ack channel when calling from off-chain?
    // Note use of JSON.stringify to deal with special characters in userName.
    const code = `@"register"!(${JSON.stringify(userName)}, 0)`;
    console.log(code);

    deploy(code);
  });

  function deploy(code) {
    return fetch('/rchain/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ term: code }),
    })
      .then(resp => resp.json())
      .then((resp) => {
        console.log('deploy response:', resp);
        return resp;
      })
      .catch((oops) => { console.log(oops); });
  }

  ui.checkButton.addEventListener('click', () => {
    const userName = ui.friendBox.value;
    // Generate a public ack channel
    // TODO this should be unforgeable. Can I make one from JS?
    const ack = Math.random().toString(36).substring(7);
    console.log(`ack is ${ack}`);

    // Check the status, sending it to the ack channel
    const code = `@["${userName}", "check"]!("${ack}")`;
    console.log(code);

    deploy(code)
      // Get the data from the node
      .then(() => fetch(`/rchain/channel/${encodeURIComponent(ack)}`))
      .then(response => response.json())
      .then((data) => {
        console.log('data received:', data.length, data);
        // TODO: If we got no blocks back, fail gracefully.

        // Data is in Rholang syntax. Since we sent a string,
        // we know we're getting a string literal back, and
        // Rholang has the same string literal syntax as JavaScript
        const lastDatum = JSON.parse(data.slice(-1).pop());
        ui.friendStatusP.innerHTML = lastDatum; //@@RHOCore.toRholang(lastDatum);
      })
      .catch((oops) => { console.log(oops); });
  });

  ui.setStatusButton.addEventListener('click', () => {
    const newStatus = ui.newStatusBox.value;
    const userName = ui.nameBox.value;

    // TODO think about this ack channel a little more.
    // Maybe the new status should come back on it for easy updating of current status display?
    // I guess it isn't too much harder to just call check
    // Note use of JSON.stringify to deal with special characters in userName.
    const code = `@["${userName}", "newStatus"]!(${JSON.stringify(newStatus)}, "ack")`;
    console.log(code);

    deploy(code).then((result) => {
      console.log(result);
      // TODO Maybe we should force a propose here? But I think the
      // node will learn to do that on it's own soon, right?
    }).catch((oops) => { console.log(oops); });
  });


/*
  proposeButton.addEventListener("click", () => {
    myNode.createBlock()
      .then(maybeBlock => myNode.addBlock(maybeBlock.block));
  })
*/
}
