from django.conf.urls import url, include
from django.contrib.auth.models import User
from rest_framework import serializers, viewsets, routers
from courseDetails import views
from notification import views as notificationView

# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')


# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


# Routers provide a way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'course/assignment', views.AssignmentViewSet)
router.register(r'course/courseInfo', views.CourseViewSet)
router.register(r'course/lt_note', views.LTNoteViewSet)
router.register(r'course/notification', views.NotificationViewSet)
router.register(r'course/teaching_staff', views.PeopleViewSet)
router.register(r'course/tutorial_note', views.TutorialNoteViewSet)
router.register(r'notification/subscribe', notificationView.NotificationSubscriptionView)


# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]