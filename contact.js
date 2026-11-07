(() => {
  const copyButton = document.getElementById('copy-email');
  const copyMessage = document.getElementById('copy-message');
  const email = 'rokpat.dm@gmail.com';

  if (copyButton && copyMessage) {
    copyButton.addEventListener('click', () => {
      if (!navigator.clipboard) {
        copyMessage.textContent = 'Select the address above to copy it.';
        return;
      }

      navigator.clipboard.writeText(email).then(() => {
        copyMessage.textContent = 'Copied.';
      }, () => {
        copyMessage.textContent = 'Select the address above to copy it.';
      });
    });
  }
})();
