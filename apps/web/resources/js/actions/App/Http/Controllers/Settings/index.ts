import ProfileController from './ProfileController'
import SecurityController from './SecurityController'
import OffSettingsController from './OffSettingsController'
import AiSettingsController from './AiSettingsController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    SecurityController: Object.assign(SecurityController, SecurityController),
    OffSettingsController: Object.assign(OffSettingsController, OffSettingsController),
    AiSettingsController: Object.assign(AiSettingsController, AiSettingsController),
}

export default Settings