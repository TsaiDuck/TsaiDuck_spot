import App from './App'
import {
	createSSRApp
} from 'vue'
import uViewNext from '@/uni_modules/uview-next';

export function createApp() {
	const app = createSSRApp(App)
	app.use(uViewNext)
	return {
		app
	}
}