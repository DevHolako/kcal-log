import ProfileController from './ProfileController'
import SecurityController from './SecurityController'
import OffSettingsController from './OffSettingsController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    SecurityController: Object.assign(SecurityController, SecurityController),
    OffSettingsController: Object.assign(OffSettingsController, OffSettingsController),
}

export default Settings