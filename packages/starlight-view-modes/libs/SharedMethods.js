import config from 'virtual:starlight-view-modes-config';



export function activateZenMode() {
  document.body.classList.add('view-modes-zen-mode');

  const zenModeOnText = document.getElementById('view-modes-zen-mode-on-text');
  if (zenModeOnText) zenModeOnText.innerText = 'Deactivate Zen Mode';

  const zenModeOffHeader = document.getElementById(
    'view-modes-zen-mode-off-header'
  );
  if (zenModeOffHeader) zenModeOffHeader.title = 'Deactivate Zen Mode';

  const zenModeOffHeaderMobile = document.getElementById(
    'view-modes-zen-mode-off-header-mobile'
  );
  if (zenModeOffHeaderMobile)
    zenModeOffHeaderMobile.title = 'Deactivate Zen Mode';

  sessionStorage.setItem('viewModesZenMode', 'true');
}

export function deactivateZenMode() {
  document.body.classList.remove('view-modes-zen-mode');

  const zenModeOnText = document.getElementById('view-modes-zen-mode-on-text');
  if (zenModeOnText) zenModeOnText.innerText = 'Activate Zen Mode';

  const zenModeOffHeader = document.getElementById(
    'view-modes-zen-mode-off-header'
  );
  if (zenModeOffHeader) zenModeOffHeader.title = 'Activate Zen Mode';

  const zenModeOffHeaderMobile = document.getElementById(
    'view-modes-zen-mode-off-header-mobile'
  );
  if (zenModeOffHeaderMobile)
    zenModeOffHeaderMobile.title = 'Activate Zen Mode';

  sessionStorage.removeItem('viewModesZenMode');
}

export function activatePresentationMode() {
  document.body.classList.add('view-modes-presentation-mode');

  const presentationModeOnText = document.getElementById(
    'view-modes-presentation-mode-on-text'
  );
  if (presentationModeOnText)
    presentationModeOnText.innerText = 'Deactivate Presentation Mode';

  const presentationModeOffHeader = document.getElementById(
    'view-modes-presentation-mode-off-header'
  );
  if (presentationModeOffHeader)
    presentationModeOffHeader.title = 'Deactivate Presentation Mode';

  const presentationModeOffHeaderMobile = document.getElementById(
    'view-modes-presentation-mode-off-header-mobile'
  );
  if (presentationModeOffHeaderMobile)
    presentationModeOffHeaderMobile.title = 'Deactivate Presentation Mode';

  sessionStorage.setItem('viewModesPresentationMode', 'true');
}

export function deactivatePresentationMode() {
  document.body.classList.remove('view-modes-presentation-mode');

  const presentationModeOnText = document.getElementById(
    'view-modes-presentation-mode-on-text'
  );
  if (presentationModeOnText)
    presentationModeOnText.innerText = 'Activate Presentation Mode';

  const presentationModeOffHeader = document.getElementById(
    'view-modes-presentation-mode-off-header'
  );
  if (presentationModeOffHeader)
    presentationModeOffHeader.title = 'Activate Presentation Mode';

  const presentationModeOffHeaderMobile = document.getElementById(
    'view-modes-presentation-mode-off-header-mobile'
  );
  if (presentationModeOffHeaderMobile)
    presentationModeOffHeaderMobile.title = 'Activate Presentation Mode';

  sessionStorage.removeItem('viewModesPresentationMode');
}

export function deactivateAllModes() {
  deactivateZenMode();
  deactivatePresentationMode();
}
