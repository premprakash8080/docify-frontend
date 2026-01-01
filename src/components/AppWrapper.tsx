import { Provider } from 'react-redux'
import { LayoutProvider } from '@/context/useLayoutContext'
import { NotificationProvider } from '@/context/useNotificationContext'
import { LoaderProvider } from '@/context/useLoaderContext'
import type { ChildrenType } from '@/types'
import { store } from '@/store/store'

const AppWrapper = ({ children }: ChildrenType) => {
  return (
    <Provider store={store}>
      <LoaderProvider>
        <LayoutProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </LayoutProvider>
      </LoaderProvider>
    </Provider>
  )
}

export default AppWrapper
